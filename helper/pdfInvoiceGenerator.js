const PDFDocument = require('pdfkit');

/**
 * Generates a Premium Sr Software  PDF Invoice Buffer for a given order object.
 * @param {Object} order - The full mongoose order document (populated with items)
 * @returns {Promise<Buffer>} - The generated PDF as a buffer
 */
exports.generatePremiumInvoiceBuffer = (order) => {
    return new Promise((resolve, reject) => {
        try {
            const invoiceNumber = `INV-${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}`;
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            // ── Correct calculation chain
            const subtotal = order.subtotal || 0;
            const discount = order.discount || 0;
            const shippingCost = order.shippingCost || 0;
            const taxableAmount = subtotal - discount + shippingCost;          // base for GST
            const gst = Math.round(taxableAmount * 0.05);            // 5% GST
            const grandTotal = taxableAmount + gst;                         // true payable amount

            // Setup PDF
            const doc = new PDFDocument({ margin: 0, size: 'A4' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', (err) => reject(err));

            // ── Brand colors
            const GOLD = '#C89A5A';
            const DARK = '#1A1A1A';
            const MUTED = '#737373';
            const LIGHT = '#F8F5F0';
            const BORDER = '#E5E0D8';

            const margin = 50;
            const pageWidth = doc.page.width;
            const contentWidth = pageWidth - (margin * 2);

            // ── HEADER BAND (Full bleed)
            doc.rect(0, 0, pageWidth, 130).fill(DARK);
            doc.rect(0, 130, pageWidth, 4).fill(GOLD);

            doc.fillColor(GOLD).fontSize(32).font('Helvetica-Bold')
                .text('Sr Software ', margin, 40);
            doc.fillColor('#E5E0D8').fontSize(9).font('Helvetica')
                .text('Premium Handcrafted Sarees', margin, 75, { characterSpacing: 1 });
            doc.fillColor('#A0A0A0').fontSize(8)
                .text('www.Sr Software .com  |  support@Sr Software .com', margin, 95);

            doc.fillColor('#FFFFFF').fontSize(28).font('Helvetica-Bold')
                .text('INVOICE', margin, 38, { align: 'right', width: contentWidth, characterSpacing: 2 });
            doc.fillColor(GOLD).fontSize(11).font('Helvetica-Bold')
                .text(invoiceNumber, margin, 75, { align: 'right', width: contentWidth });
            doc.fillColor('#E5E0D8').fontSize(9)
                .text(`Date: ${orderDate}`, margin, 95, { align: 'right', width: contentWidth });

            // ── ORDER DETAILS ROW
            let y = 165;
            const gap = 15;
            const colW = (contentWidth - (gap * 2)) / 3;

            const drawInfoBox = (x, title, lines) => {
                doc.roundedRect(x, y, colW, 150, 8).fill(LIGHT);
                doc.fillColor(GOLD).fontSize(8).font('Helvetica-Bold')
                    .text(title, x + 15, y + 15, { characterSpacing: 0.5 });

                let lineY = y + 35;
                lines.forEach(line => {
                    const font = (line.bold || line.customColor) ? 'Helvetica-Bold' : 'Helvetica';
                    const size = (line.bold || line.customColor) ? 9.5 : 8.5;
                    const color = line.customColor ? line.customColor : (line.bold ? DARK : MUTED);

                    doc.fillColor(color).fontSize(size).font(font)
                        .text(line.text, x + 15, lineY, { width: colW - 30, lineGap: 3 });

                    const h = doc.heightOfString(line.text, { width: colW - 30, lineGap: 3, font, fontSize: size });
                    lineY += h + (line.spacing || 2);
                });
            };

            const addr = [
                order.shippingAddress?.addressLine1,
                order.shippingAddress?.addressLine2,
                `${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}`,
                order.shippingAddress?.country || 'India'
            ].filter(Boolean).join('\n');

            drawInfoBox(margin, 'BILLED TO / SHIPPED TO', [
                { text: order.shippingAddress?.fullName || 'Customer', bold: true, spacing: 4 },
                { text: order.shippingAddress?.phone || '', bold: false, spacing: 8 },
                { text: addr, bold: false }
            ]);

            const statusColor = order.paymentStatus === 'Paid' ? '#1FA971' : '#B8922C';
            drawInfoBox(margin + colW + gap, 'PAYMENT DETAILS', [
                { text: 'Method:', bold: true, spacing: 4 },
                { text: order.paymentMethod || 'COD', bold: false, spacing: 14 },
                { text: 'Status:', bold: true, spacing: 4 },
                { text: order.paymentStatus || 'Pending', customColor: statusColor }
            ]);

            drawInfoBox(margin + (colW * 2) + (gap * 2), 'ORDER INFO', [
                { text: 'Order Number:', bold: true, spacing: 4 },
                { text: order.orderNumber || order._id.toString().slice(-8).toUpperCase(), bold: false, spacing: 14 },
                { text: 'Status:', bold: true, spacing: 4 },
                { text: order.orderStatus, bold: false }
            ]);

            // ── ITEMS TABLE
            y += 180;
            const tableTop = y;
            const colProduct = margin;
            const colQty = margin + 280;
            const colPrice = margin + 350;
            const colTotal = margin + 420;

            // Table header row (Rounded)
            doc.roundedRect(margin, tableTop, contentWidth, 32, 6).fill(DARK);
            doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
                .text('ITEM DESCRIPTION', colProduct + 15, tableTop + 12, { characterSpacing: 1 })
                .text('QTY', colQty, tableTop + 12, { width: 50, align: 'center', characterSpacing: 1 })
                .text('UNIT PRICE', colPrice, tableTop + 12, { width: 70, align: 'right', characterSpacing: 1 })
                .text('SUBTOTAL', colTotal, tableTop + 12, { width: 75, align: 'right', characterSpacing: 1 });

            y = tableTop + 45;

            if (order.items && Array.isArray(order.items)) {
                for (const item of order.items) {
                    const rowH = 40;

                    doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold')
                        .text(item.productName || 'Product', colProduct + 15, y, { width: 250 });

                    if (item.variant && item.variant.size) {
                        doc.fillColor(MUTED).fontSize(8.5).font('Helvetica')
                            .text(`Size: ${item.variant.size}`, colProduct + 15, y + 14);
                    }

                    doc.fillColor(DARK).fontSize(10).font('Helvetica')
                        .text(String(item.quantity || 1), colQty, y + 6, { width: 50, align: 'center' })
                        .text(`Rs. ${(item.price || 0).toLocaleString('en-IN')}`, colPrice, y + 6, { width: 70, align: 'right' })
                        .text(`Rs. ${(item.subtotal || 0).toLocaleString('en-IN')}`, colTotal, y + 6, { width: 75, align: 'right' });

                    doc.moveTo(margin, y + rowH).lineTo(margin + contentWidth, y + rowH)
                        .strokeColor(BORDER).lineWidth(0.5).stroke();

                    y += rowH + 15;
                }
            }

            // ── TOTALS SECTION
            y += 10;
            const totalsX = margin + 220;
            const totalsW = contentWidth - 220;

            const drawTotalRow = (label, value, isGrandTotal = false, color = DARK) => {
                if (isGrandTotal) {
                    doc.roundedRect(totalsX, y, totalsW, 40, 8).fill(GOLD);
                    doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold')
                        .text(label, totalsX + 15, y + 14);
                    doc.fillColor(DARK).fontSize(16).font('Helvetica-Bold')
                        .text(value, totalsX, y + 12, { width: totalsW - 15, align: 'right' });
                    y += 45;
                } else {
                    doc.fillColor(color).fontSize(9.5).font('Helvetica')
                        .text(label, totalsX + 15, y + 6)
                        .text(value, totalsX, y + 6, { width: totalsW - 15, align: 'right' });
                    y += 24;
                }
            };

            const drawDividerRow = (label, value) => {
                doc.moveTo(totalsX, y).lineTo(totalsX + totalsW, y)
                    .strokeColor(BORDER).lineWidth(1).stroke();
                y += 8;
                doc.fillColor(MUTED).fontSize(8.5).font('Helvetica-Bold')
                    .text(label.toUpperCase(), totalsX + 15, y, { characterSpacing: 0.5 });
                doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold')
                    .text(value, totalsX, y, { width: totalsW - 15, align: 'right' });
                y += 22;
                doc.moveTo(totalsX, y).lineTo(totalsX + totalsW, y)
                    .strokeColor(BORDER).lineWidth(1).stroke();
                y += 10;
            };

            drawTotalRow('Subtotal', `Rs. ${subtotal.toLocaleString('en-IN')}`);
            if (discount > 0) {
                drawTotalRow('Discount', `- Rs. ${discount.toLocaleString('en-IN')}`, false, '#1FA971');
            }
            drawTotalRow('Shipping', shippingCost > 0 ? `Rs. ${shippingCost.toLocaleString('en-IN')}` : 'FREE');

            y += 4;
            drawDividerRow('Taxable Amount', `Rs. ${taxableAmount.toLocaleString('en-IN')}`);
            drawTotalRow('GST @ 5%', `Rs. ${gst.toLocaleString('en-IN')}`, false, '#B8922C');

            y += 8;
            drawTotalRow('GRAND TOTAL', `Rs. ${grandTotal.toLocaleString('en-IN')}`, true);

            // ── FOOTER
            const footerY = doc.page.height - 100;

            if (y < footerY - 20) {
                doc.moveTo(margin, footerY).lineTo(margin + contentWidth, footerY)
                    .strokeColor(BORDER).lineWidth(0.5).stroke();

                doc.fillColor(GOLD).fontSize(10).font('Helvetica-Bold')
                    .text('Thank you for shopping with Sr Software  — Wear the Art of India.', margin, footerY + 25, { align: 'center', width: contentWidth });

                doc.fillColor(MUTED).fontSize(8).font('Helvetica')
                    .text('This is a computer-generated invoice and does not require a physical signature.', margin, footerY + 42, { align: 'center', width: contentWidth });

                doc.fillColor('#A0A0A0').fontSize(7.5).font('Helvetica')
                    .text('Sr Software  Premium Sarees • Raghuvir Scarlett, G-59, Saroli, Surat, Gujarat 395010 • support@Sr Software .com', margin, footerY + 56, { align: 'center', width: contentWidth });
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
