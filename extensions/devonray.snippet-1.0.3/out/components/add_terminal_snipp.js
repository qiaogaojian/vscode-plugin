"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTerminalSnippetForm = void 0;
const vscode_1 = require("vscode");
const multistep_1 = require("../functions/multistep");
function AddTerminalSnippetForm(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const title = "Create Terminal Snippet";
        function startAddSnipp(state) {
            return __awaiter(this, void 0, void 0, function* () {
                yield multistep_1.MultiStepInput.run((input) => addSnippContent(input, state));
                return state;
            });
        }
        function addSnippContent(input, state) {
            return __awaiter(this, void 0, void 0, function* () {
                state.content = yield input.showInputBox({
                    title,
                    step: 1,
                    totalSteps: 3,
                    value: typeof state.content === "string" ? state.content : "",
                    prompt: "Enter terminal command",
                    validate: validateSnippCommand,
                    shouldResume: shouldResume,
                });
                return (input) => addSnippName(input, state);
            });
        }
        function addSnippName(input, state) {
            return __awaiter(this, void 0, void 0, function* () {
                state.name = yield input.showInputBox({
                    title,
                    step: 2,
                    totalSteps: 3,
                    value: typeof state.name === "string" ? state.name : "",
                    prompt: "Enter snipp name",
                    validate: validateSnippName,
                    shouldResume: shouldResume,
                });
                return (input) => addSnippTags(input, state);
            });
        }
        function addSnippTags(input, state) {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                const tagString = yield input.showInputBox({
                    title,
                    step: 3,
                    totalSteps: 3,
                    value: (_b = (_a = state === null || state === void 0 ? void 0 : state.tags) === null || _a === void 0 ? void 0 : _a.join(" + ")) !== null && _b !== void 0 ? _b : "",
                    prompt: "Enter Snipp tags, use + symbol for multiple",
                    validate: validateSnippTags,
                    shouldResume: shouldResume,
                });
                state.tags = tagString
                    .split("+")
                    .map((i) => i.trim())
                    .filter((e) => e.length >= 2);
                console.warn(state);
                // const content = await getSnippText();
                // state.content = content?.text;
                state.contentType = 'shell';
                const existingSnipps = context.globalState.get("terminal_snipps", []);
                const updatedSnipps = [...existingSnipps, state];
                context.globalState.update("terminal_snipps", updatedSnipps);
                vscode_1.window.showInformationMessage("Terminal snippet saved.");
                vscode_1.commands.executeCommand("terminalSnipps.refreshEntry");
            });
        }
        function getSnippText() {
            return __awaiter(this, void 0, void 0, function* () {
                const editor = vscode_1.window.activeTextEditor;
                let text = editor === null || editor === void 0 ? void 0 : editor.document.getText(editor.selection);
                return { text, type: editor === null || editor === void 0 ? void 0 : editor.document.languageId };
            });
        }
        function validateSnippName(name) {
            return __awaiter(this, void 0, void 0, function* () {
                yield new Promise((resolve) => setTimeout(resolve, 1000));
                return name.length < 3
                    ? "Please enter a snipp name (3 characters or more)"
                    : undefined;
            });
        }
        function validateSnippCommand(content) {
            return __awaiter(this, void 0, void 0, function* () {
                yield new Promise((resolve) => setTimeout(resolve, 1000));
                return content.length < 1
                    ? "Command must contain more than 1 character"
                    : undefined;
            });
        }
        function validateSnippTags(tags) {
            return __awaiter(this, void 0, void 0, function* () {
                yield new Promise((resolve) => setTimeout(resolve, 1000));
                return tags.length < 3
                    ? "Please at least one tag for this Snipp"
                    : undefined;
            });
        }
        function shouldResume() {
            // Could show a notification with the option to resume.
            return new Promise((resolve, reject) => { });
        }
        yield startAddSnipp({ created: new Date() });
    });
}
exports.AddTerminalSnippetForm = AddTerminalSnippetForm;
//# sourceMappingURL=add_terminal_snipp.js.map