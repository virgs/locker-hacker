import { useState, type ReactElement } from 'react'
import './App.scss'
import PatternLock from "./components/PatternLock.tsx";
import PatternHistory from "./components/PatternHistory.tsx";
import Navbar from "./components/Navbar.tsx";
import { AppLayout, ContentArea, MainArea, Sidebar } from "./App.styled.tsx";
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
        if (path.length === config.length) {
            const feedback = new GuessValidator(code).validate(path)
            console.log(feedback)
            pathHistory.push(path);
            setPathHistory([...pathHistory])
            setPath([])
        } else {
            setPath([])
        }
    }

    return (
        <AppLayout>
            <Navbar />
            <ContentArea>
                <MainArea>
                    <PatternLock
                        containerSize={500}
                        pointSize={20}
                        cols={config.cols}
                        rows={config.rows}
                        path={path}
                        allowJumping={false}
                        invisible={false}
                        onChange={(pattern) => setPath(pattern)}
                        onFinish={() => onFinish()}
                    />
                </MainArea>
                <Sidebar>
                    <PatternHistory
                        pathHistory={pathHistory}
                        code={code}
                        cols={config.cols}
                        rows={config.rows}
                        entrySize={100}
                    />
                </Sidebar>
            </ContentArea>
        </AppLayout>
    )
}

export default App
