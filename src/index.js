const createElement= (type, props, ...children) => {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => {
                if(typeof child === 'object'){
                    return child
                }else{
                    return createPrimitiveElement(child)
                }
            }) 
        }
    }
}

const createPrimitiveElement= (child) => {
    return {
        type: 'PRIMITIVE_ELEMENT',
        props: {
            nodeValue: child,
            children: []
        }
    }
}

const createDom= (fiber) => {
    const dom= fiber.type === 'PRIMITIVE_ELEMENT' ? document.createTextNode('') : document.createElement(element.type)

    // attaching props to dom node
    Object
        .keys(fiber.props)
        .filter(prop => prop !== 'children')
        .forEach((prop) => {
            // console.log('prop', prop, fiber.props[prop]);
            dom[prop]= fiber.props[prop]
        })

    return dom
}

// concurrent mode- START

let nextUnitOfWork = null
let wipRoot = null
let { requestIdleCallback } = window

const render= (element, container) => {
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        }
    }
    nextUnitOfWork = wipRoot
}

const commitRoot = () => {
    commitWork(wipRoot.child)
    wipRoot = null
}

const commitWork = (fiber) => {
    if(!fiber) {
        return
    }
    const domParent = fiber.parent.dom
    domParent.appendChild(fiber.dom)
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

const workLoop= (deadline) => {
    let shouldYield= false
    while(nextUnitOfWork && !shouldYield){
        nextUnitOfWork= performUnitOfWork(nextUnitOfWork)
        shouldYield= deadline.timeRemaining() < 1
    }
    if(!nextUnitOfWork && wipRoot) {
        commitRoot()
    }
    requestIdleCallback(workLoop)
}

const performUnitOfWork= (fiber) => {
    console.log(1, fiber);
    if(!fiber.dom){
        fiber.dom= createDom(fiber)
    }

    // we will commit changes altogether, at the end of the render. so not using this
    // if(fiber.parent){
    //     fiber.parent.dom.appendChild(fiber.dom)
    //     console.log(2, fiber, fiber.parent);
    // }

    if(fiber.props.children){
        let index= 0
        let prevSibling= null
        const elements= fiber.props.children
        while(index < elements.length){
            const element= elements[index]
            const newFiber= {
                type: element.type,
                props: element.props,
                parent: fiber,
                dom: null
            }
            if(index === 0){
                fiber.child= newFiber
            }else{
                prevSibling.sibling= newFiber
            }
            prevSibling= newFiber
            index++
        }
    }
    if(fiber.child){
        return fiber.child
    }
    let nextFiber= fiber
    while(nextFiber){
        if(nextFiber.sibling){
            // searching for sibling
            return nextFiber.sibling
        }
        // if no sibling is found, then go to next parent at the top and then search for parents sibling (uncle)
        nextFiber= nextFiber.parent
    }
    return null
}

requestIdleCallback(workLoop)

// concurrent mode- END

const MyReact= {
    createElement,
    render
}

/** @jsx MyReact.createElement */
const element= (
    <div id='my-react' className='hello'>
        <h1 style='color:blue'>Creating My Own React</h1>
    </div>
)

const rootContainer= document.getElementById('root')
MyReact.render(element, rootContainer)