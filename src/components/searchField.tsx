import * as Snabbdom from "snabbdom-pragma"
import { MainDOMSource, VNode } from "@cycle/dom"
import { Stream } from "xstream"
import { css } from "emotion"

export interface Sources {
    DOM: MainDOMSource
}

export interface Sinks {
    DOM: Stream<VNode>
    value: {
        subject$: Stream<string>
    }
}

export function SearchField(sources: Sources): Sinks {
    const input$ = sources.DOM.select(".search").events("input")

    const subject$ = input$
    .map((e: Event) => (e.target as HTMLInputElement).value)
    .startWith("")

    const searchField = css({
        font: "16px/1.5em sans-serif",
        boxSizing: "border-box",
        borderRadius: "4px",
        appearance: "none",
        border: "1px solid #ddd",
        backgroundColor: "#f2f2f2",
        color: "#333"
    })

    const searchFieldContainer = css({
        display: "flex",
        alignItems: "center",
        boxSizing: "border-box",
        height: "50px",
        margin: "auto 10px",
        position: "fixed",
        top: "0px",
        zIndex: 9999,
        width: "100%",
        maxWidth: "800px",
        backgroundColor: "#fff",
    })

    const vdom$ = subject$.map(e =>
        <div>
            <div className={`${searchFieldContainer}`}>
                <input
                    className={`search ${searchField}`}
                    type="text"
                    value={ e }
                    placeholder="検索" />
            </div>
            <div className={`${css({ height: "50px" })}`}></div>
        </div>
    )

    return {
        DOM: vdom$,
        value: {
            subject$
        }
    }
}
