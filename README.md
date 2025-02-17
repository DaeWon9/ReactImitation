
# daewon-react-imitation

`daewon-react-imitation`은 바닐라 JavaScript 환경에서 **React**와 비슷한 방식으로 작동하는 프레임워크입니다.  
최소한의 설정으로 상태 관리와 렌더링을 처리할 수 있도록 도와줍니다.

## 설치 방법

먼저 `daewon-react-imitation` 라이브러리를 설치합니다.

```bash
npm install daewon-react-imitation
```

## 초기 환경 설정 (Vite 사용 시)

### 1. `global.d.ts` 설정

JSX 문법을 사용하려면 `global.d.ts` 파일에 아래와 같이 선언을 추가합니다.

```typescript
declare namespace JSX {
    type Element = string;
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}
```

### 2. `vite.config.ts` 설정

Vite에서 JSX Factory와 Fragment를 설정해야 합니다. `vite.config.ts` 파일을 아래와 같이 수정하세요.

```typescript
import { defineConfig } from "vite";

export default defineConfig({
    esbuild: {
        jsxFactory: "ReactImitation.createElement",  // JSX 컴포넌트 생성 함수
        jsxFragment: "ReactImitation.Fragment",     // JSX Fragment 처리 함수
    },
});
```

### 3. `tsconfig.json` 설정

TypeScript를 사용할 경우, `tsconfig.json` 파일에 다음 옵션을 추가해야 합니다.

```json
"compilerOptions": {
    "jsx": "react",                          
    "jsxFactory": "ReactImitation.createElement", 
    "jsxFragmentFactory": "ReactImitation.Fragment"
}
```

### 4. `main.tsx` 파일 설정

애플리케이션의 진입점인 `main.tsx`에서 `render` 함수를 사용하여 컴포넌트를 렌더링합니다.

```typescript
import { render } from "daewon-react-imitation";
import { App } from "./App";
import "./index.css";

const root = document.getElementById("app");
render(App, root);  // App 컴포넌트를 'app' ID를 가진 DOM 요소에 렌더링
```

### JSX 문법 사용 시 `ReactImitation` Import

JSX 문법을 사용하려면 각 파일 상단에 `ReactImitation`을 import 해야 합니다.

```typescript
import ReactImitation from "daewon-react-imitation";
```

## 주요 기능

### `useState`

`daewon-react-imitation`은 `useState`와 비슷한 방식으로 상태를 관리할 수 있습니다. 아래는 상태를 설정하고 사용하는 예시입니다.

```typescript
import ReactImitation, { useState } from "daewon-react-imitation";

const MyComponent = () => {
    const [count, setCount] = useState(0);

    const increment = () => setCount(count + 1);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={increment}>Increment</button>
        </div>
    );
};
```

### `useEffect`

`useEffect`는 컴포넌트가 마운트되거나 상태가 변경될 때 실행되는 사이드 이펙트를 처리하는 훅입니다. 다음은 `useEffect` 사용 예시입니다.

```typescript
import ReactImitation, { useEffect, useState } from "daewon-react-imitation";

const MyComponent = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log("Component mounted or count changed");
    }, [count]);  // count 상태가 변경될 때마다 실행

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
    );
};
```

### `useRef`

`useRef`는 DOM 요소나 값에 대한 참조를 유지하는 훅입니다. 렌더링과 무관하게 값이 유지됩니다.

```typescript
import ReactImitation, { useRef } from "daewon-react-imitation";

const MyComponent = () => {
    const inputRef = useRef(null);

    const focusInput = () => {
        inputRef.current.focus();
    };

    return (
        <div>
            <input ref={inputRef} type="text" />
            <button onClick={focusInput}>Focus Input</button>
        </div>
    );
};
```

### `navigate`

`navigate`는 페이지 이동을 할 수 있게 도와줍니다.

```typescript
import ReactImitation, { navigate } from "daewon-react-imitation";

const MyComponent = () => {
    const goToAbout = () => {
        navigate("/about");
    };

    return (
        <div>
            <button onClick={goToAbout}>Go to About</button>
        </div>
    );
};
```

### `createRouter`

`daewon-react-imitation`은 라우팅을 설정할 수 있는 기능을 제공합니다. `createRouter`를 사용하여 경로를 정의하고 각 경로에 대응하는 컴포넌트를 렌더링합니다.

```typescript
import { createRouter } from "daewon-react-imitation";

const App = () => {
    return createRouter({
        routes: [
            { path: "/", element: Home },
            { path: "/about", element: About },
        ],
    });
};
```
