# lua-script-analyzer

FiveM Lua Script Analyzer
What is this?
This is a simple, browser-based tool created to help FiveM developers find common performance issues in their client-side Lua scripts. The main goal is to automatically detect well-known causes of client-side lag (low FPS) and suggest how to fix them, leading to a smoother experience for players on your server.

This tool was made by Dark.

How to Use
You don't need to install anything to use this tool. Just follow these steps:

Open the Tool: Make sure you have the index.html, css folder, and js folder all inside one main project folder. Double-click the index.html file to open it in your web browser.

Add Your Script: You can add your Lua code in one of two ways:

Copy your script's code and paste it directly into the text box.

Click the "or upload a .lua file" link to select a file from your computer.

Analyze the Code: Click the big "Analyze Script" button.

Review the Report:

The text box at the top will clear, ready for your next script.

A new, collapsible report card will appear in the "Reviewed Scripts" section below.

This report will show you the code you submitted and a list of any potential issues it found.

What It Checks For
This analyzer is not a magic bullet, but it's programmed to look for the most frequent and critical performance problems found in FiveM scripts:

Critical: Citizen.Wait(0): It will flag any use of Citizen.Wait(0) inside a loop. This is the #1 cause of client-side lag, as it forces the code to run on every single frame.

Warning: Frequent GetEntityCoords: It will warn you if it detects GetEntityCoords being called inside a loop. While not always bad, it's often combined with Citizen.Wait(0) and can be optimized by running it less frequently.

If no common issues are found, you'll get a success message. This doesn't mean the script is perfect, but it's a very good sign!
