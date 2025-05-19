// src/ui/index.js

import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "./Popup";

// Find the <div id="root"></div> in popup.html and mount our React tree there
const container = document.getElementById("root");
createRoot(container).render(<Popup />);