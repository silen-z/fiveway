import browser from "webextension-polyfill";

void browser.devtools.panels.create("fiveway", "", "src/devtools/panel.html");
