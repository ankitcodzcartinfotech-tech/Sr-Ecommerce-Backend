const PARTIES = require('../model/parties.model');
const { addPartiesSchema, updatePartiesSchema, validateBodyData } = require('../helper/validator');
const { getProfileImage } = require('../helper/image');

const parsePartiesBody = (body) => {
    const parsed = { ...body };

    // Support JSON strings (for multipart FormData submissions)
    const jsonFields = ['generalDetails', 'bankDetail', 'billingAddress', 'shippingAddress'];
    jsonFields.forEach((field) => {
        if (typeof parsed[field] === 'string') {
            try {
                parsed[field] = JSON.parse(parsed[field]);
            } catch (e) {}
        }
    });

    // Support flat body structure mapping
    if (!parsed.generalDetails && (parsed.partyName || parsed.email || parsed.mobileNumber)) {
        parsed.generalDetails = {
            profileImage: parsed.profileImage || "",
            partyType: parsed.partyType,
            partyName: parsed.partyName,
            legalName: parsed.legalName || "",
            ledgerHead: parsed.ledgerHead || undefined,
            email: parsed.email,
            agent: parsed.agent,
            mobileNumber: parsed.mobileNumber
        };
    }
    if (!parsed.bankDetail && (parsed.gstNo || parsed.panNumber || parsed.bankIFSC || parsed.bankName || parsed.balanceStatus || parsed.creditPeriod || parsed.creditLimit)) {
        parsed.bankDetail = {
            gstNo: parsed.gstNo,
            panNumber: parsed.panNumber,
            openingBalance: parsed.openingBalance,
            balanceStatus: parsed.balanceStatus,
            creditPeriod: parsed.creditPeriod,
            creditLimit: parsed.creditLimit,
            bankName: parsed.bankName,
            bankAccountNumber: parsed.bankAccountNumber,
            bankBranchName: parsed.bankBranchName,
            bankIFSC: parsed.bankIFSC
        };
    }
    if (!parsed.billingAddress && (parsed.streetAddress || parsed.state || parsed.city)) {
        parsed.billingAddress = {
            streetAddress: parsed.streetAddress,
            state: parsed.state,
            pincode: parsed.pincode,
            city: parsed.city
        };
    }
    if (!parsed.shippingAddress && (parsed.shippingStreetAddress || parsed.shippingState || parsed.shippingCity || parsed.shippingStreet || parsed.shipping_streetAddress || parsed.shipping_state || parsed.shipping_city)) {
        parsed.shippingAddress = {
            streetAddress: parsed.shippingStreetAddress || parsed.shippingStreet || parsed.shipping_streetAddress || "",
            state: parsed.shippingState || parsed.shipping_state || "",
            pincode: parsed.shippingPincode || parsed.shipping_pincode || "",
            city: parsed.shippingCity || parsed.shipping_city || ""
        };
    }

    // safely cast nested numbers
    if (parsed.generalDetails) {
        if (parsed.generalDetails.partyType !== undefined && parsed.generalDetails.partyType !== '') {
            parsed.generalDetails.partyType = Number(parsed.generalDetails.partyType);
        } else if (parsed.generalDetails.partyType === '') {
            delete parsed.generalDetails.partyType;
        }

        if (parsed.generalDetails.mobileNumber !== undefined && parsed.generalDetails.mobileNumber !== '') {
            parsed.generalDetails.mobileNumber = Number(parsed.generalDetails.mobileNumber);
        } else if (parsed.generalDetails.mobileNumber === '') {
            delete parsed.generalDetails.mobileNumber;
        }

        if (parsed.generalDetails.ledgerHead === '' || parsed.generalDetails.ledgerHead === 'null' || parsed.generalDetails.ledgerHead === null) {
            delete parsed.generalDetails.ledgerHead;
        }
    }

    if (parsed.bankDetail) {
        if (parsed.bankDetail.openingBalance !== undefined && parsed.bankDetail.openingBalance !== '') {
            parsed.bankDetail.openingBalance = Number(parsed.bankDetail.openingBalance);
        } else if (parsed.bankDetail.openingBalance === '') {
            delete parsed.bankDetail.openingBalance;
        }

        if (parsed.bankDetail.creditPeriod !== undefined && parsed.bankDetail.creditPeriod !== '') {
            parsed.bankDetail.creditPeriod = Number(parsed.bankDetail.creditPeriod);
        } else if (parsed.bankDetail.creditPeriod === '') {
            delete parsed.bankDetail.creditPeriod;
        }

        if (parsed.bankDetail.creditLimit !== undefined && parsed.bankDetail.creditLimit !== '') {
            parsed.bankDetail.creditLimit = Number(parsed.bankDetail.creditLimit);
        } else if (parsed.bankDetail.creditLimit === '') {
            delete parsed.bankDetail.creditLimit;
        }

        if (parsed.bankDetail.balanceStatus !== undefined) {
            parsed.bankDetail.balanceStatus = String(parsed.bankDetail.balanceStatus);
        }
    }

    return parsed;
};


exports.addParty = async (req, res) => {
    try {
        const parsedBody = parsePartiesBody(req.body);
        const uploadedImage = await getProfileImage(req, 'profileImage', 'parties');
        
        if (uploadedImage) {
            if (parsedBody.generalDetails) {
                parsedBody.generalDetails.profileImage = uploadedImage;
            } else {
                parsedBody.profileImage = uploadedImage;
            }
        }

        const { error, value } = validateBodyData(addPartiesSchema, parsedBody);

        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const gstNo = value.bankDetail?.gstNo;
        if (gstNo) {
            const escapedGst = gstNo.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const existingParty = await PARTIES.findOne({
                "bankDetail.gstNo": { $regex: new RegExp(`^${escapedGst}$`, "i") }
            });
            if (existingParty) {
                return res.status(400).json({
                    success: false,
                    message: "GST Number is already registered to another party",
                    errors: ["GST Number is already registered to another party"]
                });
            }
        }

        const party = await PARTIES.create(value);

        const createdParty = await PARTIES.findById(party._id)
            .populate('generalDetails.agent')
            .populate('generalDetails.ledgerHead');

        res.status(201).json({ message: `Party created successfully....`, party: createdParty });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.getParties = async (req, res) => {
    try {
        const parties = await PARTIES.find()
            .populate('generalDetails.agent')
            .populate('generalDetails.ledgerHead')
            .sort({ createdAt: -1 });

        res.status(200).json({ message: `Parties fetched successfully....`, parties });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.getParty = async (req, res) => {
    try {
        const { id } = req.params;

        const party = await PARTIES.findById(id)
            .populate('generalDetails.agent')
            .populate('generalDetails.ledgerHead');

        if (!party) {
            return res.status(404).json({ message: `Party not found` });
        }

        res.status(200).json({ message: `Party fetched successfully....`, party });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.updateParty = async (req, res) => {
    try {
        const { id } = req.params;

        const parsedBody = parsePartiesBody(req.body);
        const uploadedImage = await getProfileImage(req, 'profileImage', 'parties');
        
        if (uploadedImage) {
            if (parsedBody.generalDetails) {
                parsedBody.generalDetails.profileImage = uploadedImage;
            } else {
                parsedBody.profileImage = uploadedImage;
            }
        }

        const { error, value } = validateBodyData(updatePartiesSchema, parsedBody);

        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const party = await PARTIES.findById(id);

        if (!party) {
            return res.status(404).json({ message: `Party not found` });
        }

        const gstNo = value.bankDetail?.gstNo;
        if (gstNo) {
            const escapedGst = gstNo.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const existingParty = await PARTIES.findOne({
                _id: { $ne: id },
                "bankDetail.gstNo": { $regex: new RegExp(`^${escapedGst}$`, "i") }
            });
            if (existingParty) {
                return res.status(400).json({
                    success: false,
                    message: "GST Number is already registered to another party",
                    errors: ["GST Number is already registered to another party"]
                });
            }
        }

        const updatedParty = await PARTIES.findByIdAndUpdate(
            id,
            value,
            { returnDocument: 'after', runValidators: true }
        )
            .populate('generalDetails.agent')
            .populate('generalDetails.ledgerHead');

        res.status(200).json({ message: `Party updated successfully....`, party: updatedParty });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.deleteParty = async (req, res) => {
    try {
        const { id } = req.params;

        const party = await PARTIES.findByIdAndDelete(id);

        if (!party) {
            return res.status(404).json({ message: `Party not found` });
        }

        res.status(200).json({ message: `Party deleted successfully....` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

// GST Detail Lookup and Auto-fill bank generator controller
exports.getGstDetails = async (req, res) => {
    try {
        const { gstNo } = req.params;
        const cleanGst = gstNo.trim().toUpperCase();

        // Standard Indian GSTIN Regex
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstRegex.test(cleanGst)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid GST number format. Must be a 15-character alphanumeric GSTIN." 
            });
        }

        // Indian State Code Mapping (Real mapping for resolving state name from GSTIN code)
        const stateCodeToName = {
            "01": "Jammu & Kashmir",
            "02": "Himachal Pradesh",
            "03": "Punjab",
            "04": "Chandigarh",
            "05": "Uttarakhand",
            "06": "Haryana",
            "07": "Delhi",
            "08": "Rajasthan",
            "09": "Uttar Pradesh",
            "10": "Bihar",
            "11": "Sikkim",
            "12": "Arunachal Pradesh",
            "13": "Nagaland",
            "14": "Manipur",
            "15": "Mizoram",
            "16": "Tripura",
            "17": "Meghalaya",
            "18": "Assam",
            "19": "West Bengal",
            "20": "Jharkhand",
            "21": "Odisha",
            "22": "Chhattisgarh",
            "23": "Madhya Pradesh",
            "24": "Gujarat",
            "25": "Daman & Diu",
            "26": "Dadra & Nagar Haveli",
            "27": "Maharashtra",
            "28": "Andhra Pradesh",
            "29": "Karnataka",
            "30": "Goa",
            "31": "Lakshadweep",
            "32": "Kerala",
            "33": "Tamil Nadu",
            "34": "Puducherry",
            "35": "Andaman & Nicobar",
            "36": "Telangana",
            "37": "Andhra Pradesh",
            "38": "Ladakh"
        };

        const stateCode = cleanGst.substring(0, 2);
        const panNumber = cleanGst.substring(2, 12);
        const resolvedStateFromCode = stateCodeToName[stateCode] || "";

        let realGstData = null;
        const apiKey = (process.env.GST_API_KEY || '').trim();
        
        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: "GST API Key is not configured. Please add GST_API_KEY in your Backend/.env file."
            });
        }

        try {
            // Read provider from env, or detect automatically
            let provider = (process.env.GST_API_PROVIDER || '').toLowerCase().trim();
            
            if (!provider) {
                // Try to auto-detect based on key prefix or format
                if (apiKey.startsWith('appy_') || apiKey.includes('appy') || apiKey.length < 20) {
                    provider = 'appyflow';
                } else if (apiKey.length === 32) {
                    provider = 'gstincheck';
                } else {
                    provider = 'prominentsolutions';
                }
            }

            let url = '';
            let headers = { 'Accept': 'application/json' };
            
            if (provider === 'appyflow') {
                url = `https://appyflow.in/api/verifyGST?gstNo=${cleanGst}&key_secret=${apiKey}`;
            } else if (provider === 'gstincheck') {
                url = `https://sheet.gstincheck.co.in/check/${apiKey}/${cleanGst}`;
            } else {
                // prominentsolutions (default)
                url = `https://api.prominentsolutions.in/api/v1/gstin/${cleanGst}`;
                headers['x-api-key'] = apiKey;
                headers['api-key'] = apiKey;
            }

            console.log(`Fetching GST details from ${provider} API...`);
            const externalResponse = await fetch(url, {
                method: 'GET',
                headers: headers
            });
            
            if (externalResponse.ok) {
                const externalResult = await externalResponse.json();
                
                if (provider === 'appyflow') {
                    if (externalResult && !externalResult.error) {
                        const info = externalResult.taxpayerInfo || externalResult;
                        realGstData = {
                            lgnm: info.lgnm,
                            tradeNam: info.tradeNam,
                            pradr: info.pradr
                        };
                    } else {
                        console.warn("Appyflow API returned error:", externalResult?.message);
                    }
                } else if (provider === 'gstincheck') {
                    if (externalResult && externalResult.flag && externalResult.data) {
                        const d = externalResult.data;
                        realGstData = {
                            lgnm: d.lgnm,
                            tradeNam: d.tradeNam,
                            pradr: d.pradr
                        };
                    } else {
                        console.warn("GSTINcheck API returned error:", externalResult?.message);
                    }
                } else {
                    // prominentsolutions
                    if (externalResult && (externalResult.success || externalResult.data)) {
                        realGstData = externalResult.data;
                    } else {
                        console.warn("ProminentSolutions API returned error:", externalResult?.message);
                    }
                }
            } else {
                console.error(`GST API HTTP error: ${externalResponse.status} ${externalResponse.statusText}`);
            }
        } catch (fetchError) {
            console.error("Exception occurred while calling GST API:", fetchError.message);
            return res.status(500).json({
                success: false,
                message: `Failed to fetch GST details: ${fetchError.message}`
            });
        }

        if (!realGstData) {
            return res.status(400).json({
                success: false,
                message: "Could not retrieve real GST details from the API. Please verify the GST number or check your API key / usage limits."
            });
        }

        // Extract real values
        const resolvedLegalName = realGstData.lgnm || realGstData.legalName || "";
        const resolvedPartyName = realGstData.tradeNam || realGstData.tradeName || resolvedLegalName;
        const pradr = realGstData.pradr?.addr || realGstData.pradr;
        
        let resolvedStreet = "";
        let resolvedCity = "";
        let resolvedState = resolvedStateFromCode;
        let resolvedPincode = "";

        if (pradr) {
            if (typeof pradr === 'string') {
                resolvedStreet = pradr;
            } else {
                // bno: building number, bnm: building name, st: street, loc: locality
                resolvedStreet = `${pradr.bno || pradr.flno || ''} ${pradr.bnm || pradr.lgm || ''} ${pradr.st || pradr.buildingName || ''} ${pradr.loc || pradr.locality || ''}`.replace(/\s+/g, ' ').trim();
                resolvedCity = pradr.dst || pradr.district || "";
                resolvedState = pradr.stcd || pradr.state || resolvedStateFromCode;
                resolvedPincode = pradr.pncd || pradr.pincode || "";
            }
        }

        // Construct response containing only real fetched values
        const gstDetails = {
            gstNo: cleanGst,
            panNumber: panNumber,
            legalName: resolvedLegalName,
            partyName: resolvedPartyName,
            email: "", // Personal email is not returned by default GST verification APIs
            mobileNumber: "", // Personal mobile number is not returned by default GST verification APIs
            billingAddress: {
                streetAddress: resolvedStreet,
                city: resolvedCity,
                state: resolvedState,
                pincode: resolvedPincode
            },
            bankDetail: {
                bankName: "", // Bank details are not returned by default GST verification APIs
                bankBranchName: "",
                bankIFSC: "",
                bankAccountNumber: ""
            }
        };

        return res.status(200).json({
            success: true,
            message: "GST details resolved successfully.",
            data: gstDetails
        });

    } catch (error) {
        console.error("Error fetching GST details:", error);
        return res.status(500).json({ success: false, message: "Internal server error lookup." });
    }
};
