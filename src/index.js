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

let nextUnitOfWork= null
let { requestIdleCallback }= window

const render= (element, container) => {
    nextUnitOfWork= {
        dom: container,
        props: {
            children: [element]
        }
    }
}

const workLoop= (deadline) => {
    let shouldYield= false
    while(nextUnitOfWork && !shouldYield){
        nextUnitOfWork= performUnitOfWork(nextUnitOfWork)
        shouldYield= deadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
}

const performUnitOfWork= (fiber) => {
    if(!fiber.dom){
        fiber.dom= createDom(fiber)
    }
    if(fiber.parent){
        fiber.parent.dom.appendChild(fiber.dom)
        console.log(fiber, fiber.parent);
    }
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
            return nextFiber.sibling
        }
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
        <h1 style="color:blue">Creating My Own React</h1>
    </div>
)

const rootContainer= document.getElementById('root')
MyReact.render(element, rootContainer)