// Neo settings and redirect pattern.
const NEO_NODE_URL = "http://n3.edgeofneo.com:10332";
const NEONS_CONTRACT_HASH = "0x50ac1c37690cc2cfc594472833cf57505d5f46de";
const REDIRECT_PATTERN = "*://*.neo/";

// Helper function to keep the extension alive.
const keepAlive = () => chrome.alarms.create("", { delayInMinutes: 1 });

// Listener for web requests that match the REDIRECT_PATTERN.
chrome.webRequest.onBeforeRequest.addListener(
    updateRules,
    { urls: [REDIRECT_PATTERN], types: ["main_frame"] },
    []
);

// Main function to update redirection rules based on the request details
async function updateRules(requestDetails) {
    // Attempt to resolve the NEO domain to a URL.
    let redirectedUrl = await resolveNeoDomain(requestDetails.url);

    // If the domain is invalid, redirect to an error page.
    if (redirectedUrl === null) {
        console.log(`Invalid domain for URL: ${requestDetails.url}`);
        await createErrorRedirectRule(requestDetails.url);
        return;
    }

    // Check if a rule already exists for this request.
    const existingRule = await findRuleByRequestUrl(requestDetails.url);
    if (existingRule) {
        console.log("Existing rule found:", existingRule);

        // If the existing rule already points to the correct URL, allow the request.
        if (
            existingRule.action.redirect &&
            existingRule.action.redirect.url === redirectedUrl
        ) {
            console.log(
                "Existing rule has correct redirect, allowing request."
            );
            return;
        } else {
            // If the redirect URL has changed, update the rule.
            console.log("Redirect URL is outdated, updating rule...");
            await updateRedirectRule(
                existingRule.id,
                redirectedUrl,
                requestDetails.url
            );
            return;
        }
    } else {
        // If no rule exists, create a new one.
        console.log("No existing rule found, creating new rule.");
        await createRedirectRule(redirectedUrl, requestDetails.url);
        return;
    }
}

// Generate a new ID for a rule based on existing ones.
async function getNewRuleId() {
    // Get all dynamic rules and determine the next ID.
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    const highestId = rules.reduce((max, rule) => Math.max(max, rule.id), 0);
    return highestId + 1;
}

// Find an existing redirection rule by the request URL.
async function findRuleByRequestUrl(requestUrl) {
    // Retrieve all dynamic rules and find the one matching the request URL.
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    return rules.find((rule) => rule.condition.urlFilter === requestUrl);
}

// Update an existing redirect rule with new URL.
async function updateRedirectRule(id, redirectUrl, conditionUrl) {
    // Update a dynamic rule by removing the old one and adding the updated rule.
    await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
            {
                id,
                priority: 1, // Priority for the rule, could be based on other logic.
                action: {
                    type: "redirect",
                    redirect: { url: redirectUrl },
                },
                condition: {
                    urlFilter: conditionUrl,
                    resourceTypes: ["main_frame"],
                },
            },
        ],
        removeRuleIds: [id],
    });
}

// Create a rule to redirect to an error page when resolution fails.
async function createErrorRedirectRule(requestUrl) {
    // Assign a new rule ID and create a redirection rule to the error page.
    const ruleId = await getNewRuleId();
    await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
            {
                id: ruleId,
                priority: 1,
                action: {
                    type: "redirect",
                    redirect: { url: chrome.runtime.getURL("error_page.html") },
                },
                condition: {
                    urlFilter: requestUrl,
                    resourceTypes: ["main_frame"],
                },
            },
        ],
    });
}

// Create a new redirect rule with the resolved URL.
async function createRedirectRule(redirectUrl, conditionUrl) {
    // Similar to creating an error redirect rule, but with the resolved URL.
    const ruleId = await getNewRuleId();
    await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
            {
                id: ruleId,
                priority: 1,
                action: {
                    type: "redirect",
                    redirect: { url: redirectUrl },
                },
                condition: {
                    urlFilter: conditionUrl,
                    resourceTypes: ["main_frame"],
                },
            },
        ],
    });
}

// Resolve a NEO domain to its actual URL.
async function resolveNeoDomain(url) {
    // Extract and format the domain to resolve.
    const domain = url.replace(/^(https?:\/\/)?/, "").replace(/\/+$/, "");
    // Setup CNAME record POST request for the domain.
    const requestOptions = {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "invokefunction",
            params: [
                NEONS_CONTRACT_HASH,
                "resolve",
                [
                    { type: "String", value: domain },
                    { type: "Integer", value: 5 },
                ],
            ],
        }),
    };

    try {
        console.log(`Resolving domain: ${domain}`);
        // Perform the request to the node.
        const response = await fetch(NEO_NODE_URL, requestOptions);

        // Handle non-success responses.
        if (!response.ok) {
            throw new Error(`Network error: ${response.status}`);
        }

        // Parse the response and extract the URL.
        const data = await response.json();
        if (!data.result || !data.result.stack || !data.result.stack[0].value) {
            throw new Error("Unexpected response format");
        }

        const encoded = data.result.stack[0].value;
        if (!encoded) {
            console.error(`No encoded value for domain: ${domain}`);
            return null;
        }

        // Decode the URL and return it.
        const decoded = new URL("https://" + atob(encoded));
        return decoded.toString();
    } catch (error) {
        // Log and handle any errors during the resolution process.
        console.info(`Error resolving domain ${domain}:`, error.message);
        return null;
    }
}
