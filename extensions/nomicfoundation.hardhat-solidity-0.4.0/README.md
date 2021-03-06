# Hardhat for Visual Studio Code

This extension adds language support for [Solidity](https://soliditylang.org/) to Visual Studio Code, and provides editor integration for [Hardhat projects](https://hardhat.org/). Integrations for other tools are coming in the near future. It supports:

- Code completion
- Go to definition, type definition and references
- Symbol renames
- Solidity code formatting through [prettier-plugin-solidity](https://github.com/prettier-solidity/prettier-plugin-solidity)
- Inline code validation from compiler errors/warnings for Hardhat projects
- Hover help for variables, function calls, errors, events etc.
- Code actions (quickfixes) suggested from compiler errors/warnings for Hardhat projects
  - Implement missing functions on interface with stubs
  - Constrain mutability by adding `view`/`pure` to function signature
  - Meet inheritance requirements by adding `virtual`/`override` on function signature
  - Provide accessibility by adding `public`/`private` to function signature

Built by the [Nomic Foundation](https://nomic.foundation/). [We’re hiring](https://nomic.foundation/hiring).

<hr />

- [Hardhat for Visual Studio Code](#hardhat-for-visual-studio-code)
  - [Installation](#installation)
  - [Setup](#setup)
  - [Hardhat Projects](#hardhat-projects)
    - [Monorepo Support](#monorepo-support)
  - [Formatting](#formatting)
    - [Formatting Configuration](#formatting-configuration)
  - [Feedback, help and news](#feedback-help-and-news)

<hr />

## Installation

**Hardhat for Visual Studio Code** can be installed by [using the Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=NomicFoundation.hardhat-solidity).

Some features (e.g. inline validation, quick fixes) are still experimental and are only enabled within a [Hardhat](https://hardhat.org/) project, this is a limitation that will be lifted with future releases.

## Setup

This extension should work without any configuration. If formatting functionality isn't working, or you have previously configured another **Solidity** formatter, please see the [formatting section](#formatting).

## Hardhat Projects

**Hardhat for Visual Studio Code** provides enhanced functionality for Solidity files within a **Hardhat** project, including inline validation and quick fixes.

To take advantage of these features, use the `File` menu to `Open Folder`, and select the folder containing the `hardhat.config.{js,ts}` file.

Inline validation (the display of compiler errors and warnings against the code) is based on your Hardhat configuration file. The version of the `solc` solidity compiler used for validation is set within this file, see the [Hardhat documentation](https://hardhat.org/config/#solidity-configuration) for more details.

### Monorepo Support

**Hardhat for Visual Studio Code** will detect Hardhat projects (folders containing a `hardhat.config.{js,ts}` file) within a monorepo, when the root of the monorepo is opened as a workspace folder.

The **Hardhat config file** that is used when validating a Solidity file is shown in the Solidity section on the _Status Bar_:

![Open Config](https://raw.githubusercontent.com/NomicFoundation/hardhat-vscode/main/docs/gifs/open-config.gif "Open Config")

## Formatting

**Hardhat for Visual Studio Code** provides formatting support for `.sol` files, by leveraging [prettier-plugin-solidity](https://github.com/prettier-solidity/prettier-plugin-solidity).

> **Note:** if you currently have other solidity extensions installed, or have had previously, they may be set as your default formatter for solidity files.

To set **Hardhat for Visual Studio Code** as your default formatter for solidity files:

1. Within a Solidity file run the _Format Document With_ command, either through the **command palette**, or by right clicking and selecting through the context menu:

![Format Document With](https://raw.githubusercontent.com/NomicFoundation/hardhat-vscode/main/docs/images/format_document_with.png "Format Document With")

2. Select `Configure Default Formatter...`

![Format Document With](https://raw.githubusercontent.com/NomicFoundation/hardhat-vscode/main/docs/images/configure_default_formatter.png "Configure default formatter")

3. Select `Hardhat + Solidity` as the default formatter for solidity files

![Format Document With](https://raw.githubusercontent.com/NomicFoundation/hardhat-vscode/main/docs/images/select_solidity_plus_hardhat.png "Confiure default formatter")

### Formatting Configuration

The default formatting rules that will be applied are taken from [prettier-plugin-solidity](https://github.com/prettier-solidity/prettier-plugin-solidity#configuration-file), with the exception that `explicitTypes` are preserved (rather than forced).

To override the settings, add a `prettierrc` configuration file at the root of your project. Add a `*.sol` file override to the prettier configuration file and change from the **defaults** shown:

```javascript
// .prettierrc.json
{
  "overrides": [
    {
      "files": "*.sol",
      "options": {
        "printWidth": 80,
        "tabWidth": 4,
        "useTabs": false,
        "singleQuote": false,
        "bracketSpacing": false,
        "explicitTypes": "preserve"
      }
    }
  ]
}
```

## Feedback, help and news

[Hardhat Support Discord server](https://hardhat.org/discord): for questions and feedback.

[Follow Hardhat on Twitter.](https://twitter.com/HardhatHQ)
