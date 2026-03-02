import { useState, type ReactElement } from 'react'
import './App.scss'
import PatternLock from "./components/PatternLock.tsx";
import PatternHistory from "./components/PatternHistory.tsx";
import { CodeGenerator } from "./game/CodeGenerator.ts";
import { GuessValidator } from "./game/GuessValidator.ts";

const config: { cols: number; rows: number; length: number } = {
    cols: 3,
    rows: 3,
    length: 4
}

export const App = (): ReactElement => {
    const [code] = useState<number[]>(new CodeGenerator(config).generate())
    const [path, setPath] = useState<number[]>([])
    const [pathHistory, setPathHistory] = useState<number[][]>([])

    const onFinish = () => {
        console.log(path, code)
        if (path.length === 4) {
            const feedback = new GuessValidator(code).validate(path)
            console.log(feedback)
            pathHistory.unshift(path);
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
                cols={config.cols}
                rows={config.rows}
                path={path}
                allowJumping={false}
                invisible={false}
                onChange={(pattern) => setPath(pattern)}
                onFinish={() => onFinish()}
            />
            <PatternHistory pathHistory={pathHistory} cols={config.cols} rows={config.rows} />
        </>
    )
}

export default App
