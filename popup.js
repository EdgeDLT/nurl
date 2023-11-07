async function deleteAllRules() {
    try {
        let rules = await chrome.declarativeNetRequest.getDynamicRules();
        console.log('Current rules:', rules);
        let ids = rules.map(rule => rule.id);
        await deleteRules(ids);
        console.log("All rules have been successfully cleared.");
        updateStatus("All dynamic rules have been reset successfully.");
    } catch (error) {
        console.error("Error deleting all rules:", error);
        updateStatus("Failed to reset the rules. Check the console for details.", true);
    }
}

async function deleteRules(ids) {
    return new Promise((resolve, reject) => {
        chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [],
            removeRuleIds: ids
        }, () => {
            const err = chrome.runtime.lastError;
            if (err) {
                reject(new Error(err.message));
            } else {
                resolve();
            }
        });
    });
}

function updateStatus(message, isError) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    if (isError) {
        statusElement.style.color = 'red';
    } else {
        statusElement.style.color = 'green';
    }
    setTimeout(() => {
        statusElement.textContent = '';
    }, 5000);
}

document.getElementById("reset").addEventListener("click", deleteAllRules);
