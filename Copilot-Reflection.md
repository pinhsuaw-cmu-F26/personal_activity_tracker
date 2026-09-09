# GitHub Copilot Reflection

## Development Process

At the beginning of the project, I asked GitHub Copilot to build the Personal Activity Tracker according to the written requirements. Copilot helped me create the project structure, implement the Express and SQLite backend, add the REST API endpoints, integrate Socket.io for real-time updates, and build the Activity Monitor and Activity Trend pages. It also helped generate automated tests, REST Client examples, and setup documentation.

## Reviewing the Wireframe

After reviewing the first implementation, I noticed that the application was functional but did not closely match the provided wireframe. I reopened the Google Docs requirements document in the browser and asked Copilot to inspect the wireframe again and update the interface based on it.

Copilot created a separate `wireframe-alignment` branch for these changes. It redesigned the activity cards into compact horizontal rows, added activity icons, adjusted the Monitor page borders and scrolling area, simplified the Trend page around the main seven-day calories chart, and updated the date fields to use the English `MM/DD/YYYY` format.

## Testing and Verification

After the UI changes, I ran the automated API tests again and confirmed that all three tests passed. I also opened both pages in the browser and verified the updated layout with sample activities. The Monitor page grouped activities by day, displayed the activity details in the new row format, and correctly omitted distance for Pickleball. The Trend page displayed the seven-day calories chart.

## What Worked Well

Copilot was especially useful for quickly generating the initial application structure and connecting multiple parts of the project. It was able to work across the backend, database, frontend, tests, and documentation. It also helped create a Git branch, commit the changes, push the branch, and prepare a pull request.

## What Needed Improvement

The first implementation focused more on satisfying the functional requirements than matching the visual wireframe. I needed to review the result manually and provide the wireframe as additional context before asking Copilot to make the visual changes. This showed me that generated code still needs to be compared carefully with the original requirements and design references.

The browser's native date input also displayed localized Chinese date labels on my system. I asked Copilot to change the fields to a fixed English `MM/DD/YYYY` format so that the interface would be consistent with the wireframe and the project presentation.

## Conclusion

This project showed me that GitHub Copilot is effective for building a working prototype quickly, especially when the requirements are clearly described. However, human review is still important for visual accuracy, interaction details, and validating that the implementation matches the original design. Reopening the source document and giving Copilot more specific context led to a better final result.
