export interface MoodleNode {
    parent?: MoodleNode
    name: string
}

export interface CategoryNode extends MoodleNode {
    children: MoodleNode[]
}

export function isCategoryNode(node: MoodleNode): node is CategoryNode {
    return ("children" in node)
}

export interface HrefNode extends MoodleNode {
    url: string
}

export function isHrefNode(node: MoodleNode): node is HrefNode {
    return ("url" in node)
}

function isDef<T>(x: T | undefined): x is T {
    return x !== undefined
}

export function deserialize(text: string): MoodleNode[] {
    interface ProcessingNode {
        parent?: number
        name: string
        url?: string
        id?: string
    }

    const { baseURL, tree: serializedTree } = JSON.parse(text) as { baseURL: string, tree: ProcessingNode[] }

    const tree: MoodleNode[] = serializedTree.reduce((pre, e) => {
        const node: MoodleNode = { name: e.name }

        if (isDef(e.parent)) {
            const parent = pre[e.parent]
            node.parent = parent
            if (!isCategoryNode(parent)) Object.assign(parent, { children: [] })
            if (isCategoryNode(parent)) parent.children.push(node)
        }

        if (isDef(e.url)) Object.assign(node, { url: e.url })
        if (isDef(e.id)) Object.assign(node, { url: `${baseURL}?id=${e.id}` })

        pre.push(node)
        return pre
    }, [] as MoodleNode[])

    return tree
}

export function filterLeaves(subject: string, node: CategoryNode): CategoryNode {
    const filtered = node.children
    .map(e => isCategoryNode(e) ? filterLeaves(subject, e) : e)
    .filter(e => !isCategoryNode(e) || e.children.length != 0)
    .filter(e => !isHrefNode(e) || (!e.name.length || e.name.toLowerCase().includes(subject.toLowerCase())))

    return {
        parent: node.parent,
        name: node.name,
        children: filtered
    }
}
