/// <reference path="../pb_data/types.d.ts" />

/**
 * CORRECTED HOOK - This version is based on the provided types.d.ts file.
 * It accesses the application methods directly without using .dao().
 *
 * @param {core.RecordEvent} e The event object for the record creation.
 */
onRecordAfterCreateSuccess((e) => {
    console.log(`[Hook] 'onRecordAfterCreateSuccess' triggered for record: ${e.record.id}`);

    // --- YOUR TOKEN IS CORRECTLY PLACED HERE ---
    const userPushToken = "ExponentPushToken[FpPqoUAhw-7jFEVRx1KGxx]";

    // --- Validation ---
    if (!userPushToken || !userPushToken.startsWith("ExponentPushToken")) {
        console.error("[Hook] Push token is missing or invalid.");
        return;
    }

    console.log(`[Hook] Preparing to send notification to hard-coded token: ${userPushToken}`);

    try {
        // --- Prepare Notification ---
        const imageRecord = e.record;

        // --- CORRECTED: Accessing findCollectionByNameOrId directly on the $app instance ---
        const collection = $app.findCollectionByNameOrId("item_images");
        if (!collection) {
            console.error("[Hook] Could not find the 'item_images' collection.");
            return;
        }

        // --- CORRECTED: Manually constructing the file URL ---
        // This uses the appURL from settings, which is the reliable way based on types.d.ts.
        const fileUrl = `${$app.settings().meta.appURL}api/files/${collection.id}/${imageRecord.id}/${imageRecord.getString("image")}`;

        const pushNotificationPayload = {
            to: userPushToken,
            sound: "default",
            title: "New Item Scanned! (Test)",
            body: `Tap here to add details.`,
            data: {
                imageRecordId: imageRecord.id,
                imageUrl: fileUrl,
            },
        };

        // --- Send Notification ---
        console.log("[Hook] Sending HTTP request to Expo Push service...");
        const response = $http.send({
            url: "https://exp.host/--/api/v2/push/send",
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
             },
            body: JSON.stringify(pushNotificationPayload),
            timeout: 10,
        });

        console.log(`[Hook] Received response from Expo Push service. Status: ${response.statusCode}`);
        console.log(`[Hook] Response Body: ${response.raw.toString()}`);

        if (response.statusCode !== 200) {
            console.error(`[Hook] Expo Push service returned a non-200 status code: ${response.statusCode}`);
        } else {
            console.log("[Hook] Push notification request appears to be successful.");
        }

    } catch (err) {
        console.error(`[Hook] CRITICAL: An error occurred while preparing or sending the notification. Error: ${err}`);
    }

}, "item_images");

