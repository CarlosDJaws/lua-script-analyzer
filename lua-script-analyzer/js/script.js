const codeEditor = document.getElementById('code-editor');
const fileUpload = document.getElementById('file-upload');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsHistoryContainer = document.getElementById('results-history-container');
const resultsPlaceholder = document.getElementById('results-placeholder');

// File Upload Logic
fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            codeEditor.value = event.target.result;
        };
        reader.readAsText(file);
    }
});

// Analysis Logic
analyzeBtn.addEventListener('click', () => {
    const code = codeEditor.value;
    if (!code.trim()) {
        alert('Please paste or upload some code to analyze.');
        return;
    }
    
    // Hide the initial placeholder text
    if(resultsPlaceholder) {
        resultsPlaceholder.style.display = 'none';
    }
    
    const issues = analyzeCode(code);
    createReportCard(code, issues);

    // Clear the editor for the next analysis
    codeEditor.value = '';
});

function createReportCard(code, issues) {
    const reportCard = document.createElement('details');
    reportCard.className = 'report-card bg-gray-700/40 rounded-lg';
    reportCard.open = true; // Open by default

    const summary = document.createElement('summary');
    summary.className = 'flex justify-between items-center p-4 font-semibold';
    
    const issueCount = issues.length;
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    let summaryText = `${issueCount} potential issue(s) found.`;
    if (issueCount === 0) {
        summaryText = '✅ No obvious issues found.';
    }

    summary.innerHTML = `
        <span>${summaryText} <span class="text-xs text-gray-400">(Analyzed at ${new Date().toLocaleTimeString()})</span></span>
        <div class="flex items-center">
            ${criticalCount > 0 ? `<span class="text-xs font-bold text-red-400 mr-3">${criticalCount} CRITICAL</span>` : ''}
            <span class="arrow text-gray-400">▶</span>
        </div>
    `;

    const reportContent = document.createElement('div');
    reportContent.className = 'p-4 border-t border-gray-600';

    // Add analyzed code block
    const codeBlockTitle = document.createElement('h4');
    codeBlockTitle.className = 'font-bold mb-2';
    codeBlockTitle.textContent = 'Analyzed Code:';
    reportContent.appendChild(codeBlockTitle);

    const codeBlock = document.createElement('div');
    codeBlock.className = 'mb-4 bg-gray-900 p-3 rounded max-h-60 overflow-y-auto';
    codeBlock.innerHTML = `<pre><code class="language-lua">${Prism.highlight(code, Prism.languages.lua, 'lua')}</code></pre>`;
    reportContent.appendChild(codeBlock);

    // Add issues
    const issuesTitle = document.createElement('h4');
    issuesTitle.className = 'font-bold mb-2';
    issuesTitle.textContent = 'Report:';
    reportContent.appendChild(issuesTitle);

    if (issues.length === 0) {
        const noIssuesCard = createIssueCard({
            line: '🎉',
            title: 'No Obvious Issues Found!',
            description: 'The analyzer did not find any of the common performance issues it checks for. This does not guarantee the script is perfect, but it\'s a great start!',
            severity: 'success'
        });
        reportContent.appendChild(noIssuesCard);
    } else {
        issues.forEach(issue => {
            const issueCard = createIssueCard(issue);
            reportContent.appendChild(issueCard);
        });
    }

    reportCard.appendChild(summary);
    reportCard.appendChild(reportContent);

    // Add the new report card to the top of the history
    resultsHistoryContainer.prepend(reportCard);
}


function analyzeCode(code) {
    const issues = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
        const lineNumber = index + 1;

        // Check for Citizen.Wait(0)
        if (/\bCitizen\.Wait\(\s*0\s*\)/.test(line)) {
            issues.push({
                line: lineNumber,
                title: 'Critical: `Citizen.Wait(0)` Detected',
                description: 'This creates a loop that runs every frame (60+ times per second), which is a major cause of client-side lag. The thread should be put to sleep for longer.',
                suggestion: 'Increase the wait time (e.g., `Citizen.Wait(500)`) and use distance checks to only run code when the player is nearby.',
                severity: 'critical',
                code: line.trim()
            });
        }

        // Check for GetEntityCoords in a loop (heuristic)
        if (/\bGetEntityCoords\s*\(/.test(line) && isPotentiallyInLoop(lines, index)) {
             if (!issues.some(i => i.line === lineNumber)) { // Avoid duplicate issue on same line
                issues.push({
                    line: lineNumber,
                    title: 'Warning: Frequent `GetEntityCoords` Call',
                    description: 'Calling `GetEntityCoords` frequently inside a loop can be inefficient. This is often paired with a `Citizen.Wait(0)`.',
                    suggestion: 'Ensure this loop has a proper wait time (e.g., 500-1000ms) and only runs when the player is within a reasonable distance of the target area.',
                    severity: 'warning',
                    code: line.trim()
                });
            }
        }
    });

    return issues;
}

function isPotentiallyInLoop(lines, index) {
    // This is a simple heuristic.
    let openLoops = 0;
    for (let i = index - 1; i >= 0 && i > index - 50; i--) {
        if (/\bwhile\b/.test(lines[i]) && !lines[i].includes('do')) continue; // Simple guard against `end) while`
        if (/\bwhile\b/.test(lines[i])) openLoops++;
        if (/\bend\b/.test(lines[i])) openLoops--;
    }
    return openLoops > 0;
}

function createIssueCard(issue) {
    const card = document.createElement('div');
    let severityClass = `issue-${issue.severity}`;
    if (issue.severity === 'success') {
         severityClass = 'border-green-500';
    }
    
    card.className = `issue-card ${severityClass} bg-gray-700/60 p-4 rounded-lg mb-2`;
    
    let suggestionHtml = '';
    if(issue.suggestion) {
        suggestionHtml = `<p class="text-sm text-gray-300 mt-2"><strong class="font-semibold text-green-400">Suggestion:</strong> ${issue.suggestion}</p>`;
    }

    card.innerHTML = `
        <div class="flex justify-between items-center">
            <h3 class="font-bold text-lg">${issue.title}</h3>
            <span class="text-sm font-mono bg-gray-900 px-2 py-1 rounded">${issue.line}</span>
        </div>
        <p class="text-gray-400 mt-1">${issue.description}</p>
        ${suggestionHtml}
        ${issue.code ? `
        <div class="mt-4 bg-gray-900 p-3 rounded">
            <pre><code class="language-lua">${Prism.highlight(issue.code, Prism.languages.lua, 'lua')}</code></pre>
        </div>
        ` : ''}
    `;
    return card;
}