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


const render= (element, container) => {
    const dom= element.type === 'PRIMITIVE_ELEMENT' ? document.createTextNode('') : document.createElement(element.type)

    // attaching props to dom node
    Object
        .keys(element.props)
        .filter(prop => prop !== 'children')
        .forEach((prop) => {
            console.log('prop', prop, element.props[prop]);
            dom[prop]= element.props[prop]
        })

    // attaching children to dom node by recursive call
    element.props.children.forEach(child => {
        render(child, dom)
    })

    container.appendChild(dom)
}

// concurrent mode- START

let nextUnitOfWork= null
let { requestIdleCallback }= window

const workLoop= (deadline) => {
    let shouldYield= false
    while(nextUnitOfWork && !shouldYield){
        nextUnitOfWork= performUnitOfWork(nextUnitOfWork)
        shouldYield= deadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
}

const performUnitOfWork= (unitOfWork) => {

}


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