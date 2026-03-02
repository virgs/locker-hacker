import {useState, type ReactElement} from 'react'
import './App.scss'
import PatternLock from "./components/PatternLock.tsx";

export const App = (): ReactElement => {
    const [path, setPath] = useState<number[]>([])
    const [pathHistory, setPathHistory] = useState<number[][]>([])

    const onFinish = () => {
        if (path.length === 4) {
            pathHistory.push(path);
            setPathHistory(pathHistory)
            setPath([])
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
                path={path}
                dynamicLineWidth={false}
                allowJumping={false}
                invisible={false}
                onChange={(pattern) => setPath(pattern)}
                onFinish={() => onFinish()}
            />
            {pathHistory.map((historyPath, index) => {
                return <PatternLock
                    key={`history-${index}`}
                    containerSize={200}
                    pointSize={20}
                    disabled={true}
                    width={4}
                    height={3}
                    path={historyPath}
                    dynamicLineWidth={true}
                    arrowHeads={true}
                    arrowHeadSize={20}
                    allowJumping={false}
                />
            })}
        </>
    )
}

export default App
