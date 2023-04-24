import React from "react";
import GlobalContext from "src/context/Context";
import {Context} from "src/context/Context";
import { language, languageId } from "src/context/language";

export interface PageContext {
    lan: number,
}
abstract class Page<Prop={},State={}> extends React.Component<Prop,State> {
    constructor(props: Prop) {
        super(props);
    }
    abstract renderPage(context: PageContext): React.ReactNode 
    render(): React.ReactNode {
        return <GlobalContext.Consumer>
            {context => {
                return this.renderPage(context);
            }}
        </GlobalContext.Consumer>
    }
}

export default Page;