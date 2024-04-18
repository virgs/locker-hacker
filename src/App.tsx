import { useEffect, useState } from 'react'
import './App.scss'
import PatternLock from 'react-pattern-lock/lib/components/PatternLock'

export const App = (): JSX.Element => {
  const [path, setPath] = useState<number[]>([])

  useEffect(() => {
    console.log(path)
  }, [path])

  return (
    <>
      <PatternLock
        width={200}
        pointSize={20}
        size={3}
        path={path}
        allowJumping={true}
        onChange={(pattern) => setPath(pattern)}
        onFinish={() => {
          console.log('finish')
          // check if the pattern is correct
        }}
      />
      <PatternLock
        width={100}
        pointSize={20}
        size={3}
        path={path}
        allowJumping={true}
        onChange={(pattern) => setPath(pattern)}
        onFinish={() => {
          console.log('finish')
          // check if the pattern is correct
        }}
      />
    </>
  )
}

export default App
