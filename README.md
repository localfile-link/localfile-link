# [localfile.link](https://localfile.link)

Remote links from browsers to open local files in users' local editor.

## Motivations

For developer tools generated reports in HTML, like [cpupro](https://github.com/lahmatiy/cpupro), [speedscope](https://github.com/jlfwong/speedscope), [@eslint/config-inspector](https://github.com/eslint/config-inspector), coverages reports etc., it's common for them to provide information about your local code files. While the web gives us a lot of flexibility and interactiveness to build nice and useful UIs to present those data, on the other hand, by its definition, web is sandboxed. When you have a server, we could use [launch-editor](https://github.com/yyx990803/launch-editor) and send a signal from the client to ask the server to open the editor for you. But in cases where you serve static HTML files or hosted inspectors, you lose such capability.

## How it works

[localfile.link](https://localfile.link) try to provide a universal way to solve this problem where developers of those devtools only need to redirect users to a URL like `https://localfile.link?file=<filepath>` without needing a dedicated dev server.

Under the hook, `localfile.link` works with [client app](./client) that register a custom [deep link](https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app) protocol to `localfile://` the browsers. The webpage will redirects users to that protocol, which launches the client to open the filepath in your editor.

> [!IMPORTANT]
> Working in progress
