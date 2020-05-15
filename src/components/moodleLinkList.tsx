import * as Snabbdom from "snabbdom-pragma"
import { Stream } from "xstream"
import { VNode } from "@cycle/dom"
import { css } from "emotion"

import { CategoryNode, HrefNode, isCategoryNode, isHrefNode } from "../utilities/moodleInfoUtil"

export interface Sources {
    props: {
        tree: Stream<CategoryNode>
    }
}

export interface Sinks {
    DOM: Stream<VNode>
}

function treeToDOM(node: CategoryNode, category: string[] = []): VNode[] {
    if (category.length == 0) {
        for (let p = node.parent; p != undefined; p = p.parent) category.push(p.name)
        category.reverse()
    }

    const [ categoryNodes, hrefNodes ] = node.children
    .reduce(([arr0, arr1], e) => {
        if (isCategoryNode(e)) arr0.push(e)
        if (isHrefNode(e)) arr1.push(e)
        return [arr0, arr1]
    }, [[], []] as [CategoryNode[], HrefNode[]])

    const list = []
    if (hrefNodes.length != 0) {
        const unique = Math.random().toString(36).substr(2)

        const linkListContainer = css({
            margin: "0 10px"
        })

        const foldFlag = css({
            display: "none",
            ":not(:checked) ~ .link-list-fold": {
                display: "none"
            },
            ":not(:checked) ~ .category-name-fold": {
                color: "#555",
                ".folded-arrow": {
                    transform: "rotate(.125turn)"
                }
            }
        })

        const categoryName = css({
            display: "block",
            position: "sticky",
            top: "0px",
            borderBottom: "solid 2px #555",
            margin: "10px 0 0",
            backgroundColor: "#fff",
        })

        const foldArrowContainer = css({
            position: "absolute",
            right: "0",
            bottom: "0",
            height: "20px",
            width: "20px"
        })

        const expandedArrow = css({
            height: "7px",
            width: "7px",
            borderLeft: "solid 2px #555",
            borderBottom: "solid 2px #555",
            transform: "rotate(-.125turn)"
        })

        const moodleCourseLink = css({
            color: "#1e90ff",
            textDecoration: "none",
            fontSize: "16px",
            lineHeight: "1.5em"
        })

        const superCategory = css({
            fontSize: "10px",
            color: "#555",
            fontWeight: "bold"
        })

        const directSuperCategory = css({
            fontSize: "18px",
            fontWeight: "bold"
        })

        const linkList = css({
            padding: "0px"
        })

        const linkListItem = css({
            listStyle: "none",
            margin: "0"
        })

        list.push(
            <div className={`${linkListContainer}`}>
                <input
                    id={`switch-${unique}`}
                    type="checkbox"
                    checked={unique} // need to update forcibly
                    className={`${foldFlag}`} />
                <label
                    htmlFor={`switch-${unique}`}
                    className={`category-name-fold ${categoryName}`}>
                    <div>
                        <div className={`${superCategory}`}>
                            { category.map(e => `${e} / `) }
                        </div>
                        <div className={`${directSuperCategory}`}>
                            { node.name }
                        </div>
                    </div>
                    <div className={`${foldArrowContainer}`}>
                        <div className={`folded-arrow ${expandedArrow}`}></div>
                    </div>
                </label>
                <ul className={`link-list-fold ${linkList}`}>
                    {
                        hrefNodes.map(({ name, url }) =>
                            <li className={`${linkListItem}`}>
                                <a href={ url } className={`${moodleCourseLink}`}>
                                    { name }
                                </a>
                            </li>
                        )
                    }
                </ul>
            </div>
        )
    }

    const res = categoryNodes
    .flatMap(e => treeToDOM(e, category.concat(node.name)))
    .reduce((pre, e) => {
        pre.push(e)
        return pre
    }, list)

    return res
}

export function moodleLinkList(sources: Sources): Sinks {
    return {
        DOM: sources.props.tree.map(e => <div>{ treeToDOM(e) }</div>)
    }
}
