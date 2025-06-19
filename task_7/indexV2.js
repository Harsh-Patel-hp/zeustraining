import { BackgroundManager } from "./BackgroundManager.js";
import { DraggableChild } from "./DraggableChild.js";

const bgManager = new BackgroundManager("#03A9F4", "50vh", "50vw");
new DraggableChild(bgManager.getElement(), "white").automove(1);

const bgManager2 = new BackgroundManager("#e7e7e7", "50vh", "50vw");
new DraggableChild(bgManager2.getElement(), "#008dcd").automove(5);

const bgManager3 = new BackgroundManager("#b9b9b9", "50vh", "50vw");
new DraggableChild(bgManager3.getElement(), "#384483").automove(10);

const bgManager4 = new BackgroundManager("#00bcd4", "50vh", "50vw");
new DraggableChild(bgManager4.getElement(), "#cdcdcd").automove(15);
