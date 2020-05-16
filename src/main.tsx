import xs, { Stream } from "xstream"
import debounce from "xstream/extra/debounce"
import run from "@cycle/run"
import { VNode, MainDOMSource, makeDOMDriver } from "@cycle/dom"
import { makeHTTPDriver, HTTPSource } from "@cycle/http"
import { css } from "emotion"
import * as Snabbdom from "snabbdom-pragma"

import { deserialize, filterLeaves, CategoryNode } from "./utilities/moodleInfoUtil"
import { SearchField } from "./components/searchField"
import { moodleLinkList } from "./components/moodleLinkList"

interface Sources {
    DOM: MainDOMSource
    HTTP: HTTPSource
}

interface Sinks {
    DOM: Stream<VNode>
    HTTP: Stream<{ url: string, category: string }>
}

function main(sources: Sources): Sinks {
    const request$ = xs.of({
        url: "./kit-moodle-course-links.json",
        category: "kit-moodle-course-links"
    })

    const response$ = sources.HTTP
        .select("kit-moodle-course-links")
        .flatten()
        .map(res => deserialize(res.text))

    const searchFieldSink = SearchField({
        DOM: sources.DOM
    })

    const result$ = xs.combine(response$, searchFieldSink.value.subject$.compose(debounce(200)))
        .map(([ res, name ]) => filterLeaves(name, res[0] as CategoryNode))

    const moodleLinkListSink = moodleLinkList({
        props: { tree: result$ }
    })

    const vdom$ = xs.combine(searchFieldSink.DOM, moodleLinkListSink.DOM)
    .map(([ searchField, moodleLinkList ]) =>
        <div
        className={`container ${css({
            maxWidth: "800px",
            margin: "auto",
            height: `${window.innerHeight}px`,
            display: "flex",
            flexFlow: "column"
        })}`}>
            <div className={`${css({
                flex: "0 1"
            })}`}>
                { searchField }
            </div>
            <div className={`${css({
                overflowY: "scroll",
                flex: "1 1 auto"
            })}`}>
                { moodleLinkList }
            </div>
        </div>
    )

    return {
        DOM: vdom$,
        HTTP: request$
    }
}

const drivers = {
    DOM: makeDOMDriver("#app", {
        reportSnabbdomError: _ => {
            alert("Internal Error\nPlease reload")
            location.reload()
        }
    }),
    HTTP: makeHTTPDriver(),
}

run(main, drivers)
console.log(String.raw`%c
                  _____.___.  _____   ____  __.  _____  .____
                  \__  |   | /  _  \ |    |/ _| /     \ |    |
                   /   |   |/  /_\  \|      <  /  \ /  \|    |
                   \____   /    |    \    |  \/    Y    \    |___
                   / ______\____|__  /____|__ \____|__  /_______ \
                   \/              \/        \/       \/        \/

                            Yet Another KIT Moodle Links

Welcome to YAKML console! This site is made of typescript, cycle.js, xstream, and emotion.
If you are interested in development, please visit https://github.com/shouth/yakml !
`,"color: #1e90ff")
