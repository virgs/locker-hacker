import {useState, type ReactElement} from 'react'
import './App.scss'
import PatternLock from "./components/PatternLock.tsx";

export const App = (): ReactElement => {
    const [path, setPath] = useState<number[]>([])

    const onFinish = () => {
        if (path.length === 4) {
            console.log("Right path")
            console.log(path)
        } else {
            setPath([])
        }
    }

    return (
        <>
            <PatternLock
                containerSize={200}
                pointSize={20}
                width={4}
                height={3}
                arrowHeads={false}
                path={path}
                allowJumping={false}
                onChange={(pattern) => setPath(pattern)}
                onFinish={() => onFinish()}
            />
            <PatternLock
                containerSize={200}
                pointSize={20}
                disabled={true}
                width={4}
                height={3}
                path={path}
                arrowHeads={true}
                allowJumping={false}
                onChange={() => {

                }}
                onFinish={() => {
                    // check if the pattern is correct
                }}
            />
        </>
    )
}

export default App
