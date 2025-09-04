import { ImapController } from "../controllers/ImapController.js";

export class ImapControllerFactory {
    private static instance: ImapController;
    private constructor() {}

    public static getInstance(): ImapController {
        if (!ImapControllerFactory.instance) {
            ImapControllerFactory.instance = new ImapController();
        }
        return ImapControllerFactory.instance;
    }

}   