import { TextVDOM, TextVDOMNode, VDOM } from '../types';
import { isTextVDOM, isTextVDOMNode, isVDOM } from '../utils';
import {
  getNewVDOM,
  getRoot,
  getVDOM,
  resetAllComponentKeysIndex,
  resetIndexMap,
  resetNstChildIndexMap,
  setVDOM,
} from '../vdom/store';
import { createDOM } from './createDom';
import { setAttributes } from './setAttributes';

/**
 * updateDOM 함수는 가상 DOM(Virtual DOM)과 실제 DOM을 비교하고, 변경 사항을 적용합니다.
 */
export function updateDOM(
  $parent: HTMLElement = getRoot(),
  nextVDOM: VDOM = getNewVDOM(),
  prevVDOM: VDOM = getVDOM()
): void {
  resetAllComponentKeysIndex();
  resetIndexMap();
  resetNstChildIndexMap();
  updateElement($parent, nextVDOM, prevVDOM);
  setVDOM(nextVDOM);
}

/**
 * updateElement 함수는 주어진 VDOM을 기준으로 DOM 트리를 업데이트합니다.
 */
export function updateElement(
  $parent: HTMLElement | Text,
  nextVDOM?: VDOM | TextVDOM,
  prevVDOM?: VDOM | TextVDOM
): void {
  let $current = prevVDOM?.current;

  if (!$current && isTextVDOMNode(prevVDOM)) {
    const childIndex = findChildIndexByTextVDOMNode($parent, prevVDOM);
    if (childIndex !== -1) {
      $current = $parent.childNodes[childIndex] as Text;
    }
  }

  // 1. 새로운 VDOM이 없는 경우: 기존 DOM 제거
  if (!nextVDOM) {
    if ($current) {
      $parent.removeChild($current);
    }
    return;
  }

  // 2. 이전 VDOM이 없는 경우: 새로운 DOM 추가
  if (!prevVDOM) {
    const $newElement = createDOM(nextVDOM);
    if ($newElement) {
      $parent.appendChild($newElement);
      nextVDOM.current = $newElement;
    }
    return;
  }

  // 3. 텍스트 노드 비교 및 업데이트
  if (isTextVDOM(prevVDOM) && isTextVDOM(nextVDOM)) {
    if (prevVDOM.value !== nextVDOM.value) {
      const $newTextNode = createDOM(nextVDOM) as Text;
      if ($current && $newTextNode) {
        $current.replaceWith($newTextNode);
        nextVDOM.current = $newTextNode;
      }
    } else {
      nextVDOM.current = prevVDOM.current;
    }
    return;
  }

  // 4. VDOM의 타입이 다른 경우: DOM 교체
  if (typeof prevVDOM !== typeof nextVDOM) {
    const $newElement = createDOM(nextVDOM);
    if ($current && $newElement) {
      $current.replaceWith($newElement);
      nextVDOM.current = $newElement;
    }
    return;
  }

  // 5. 태그, 키 또는 props가 다른 경우: DOM 전체 교체
  if (isVDOM(prevVDOM) && isVDOM(nextVDOM)) {
    if (
      prevVDOM.tag !== nextVDOM.tag ||
      prevVDOM.props?.key !== nextVDOM.props?.key ||
      !deepEquals(prevVDOM.props, nextVDOM.props)
    ) {
      const $newElement = createDOM(nextVDOM);
      if ($current && $newElement) {
        $current.replaceWith($newElement);
        nextVDOM.current = $newElement;
      }
      return;
    }
  }

  // 6. 동일한 태그: 속성 업데이트 및 자식 노드 재귀 처리
  const $el = $current as HTMLElement;

  if ($el instanceof HTMLElement) {
    // nextVDOM이 VDOM일 때만 props를 처리
    if (isVDOM(nextVDOM)) {
      setAttributes(nextVDOM.props, $el);
    }

    const prevChildren = isVDOM(prevVDOM)
      ? (prevVDOM as VDOM).children || []
      : [];
    const nextChildren = isVDOM(nextVDOM)
      ? (nextVDOM as VDOM).children || []
      : [];

    // 자식 노드 비교 및 업데이트
    const maxChildren = Math.max(prevChildren.length, nextChildren.length);
    for (let i = 0; i < maxChildren; i++) {
      let prevChild = prevChildren[i];
      let nextChild = nextChildren[i];

      // TextVDOMNode일 때 텍스트 노드로 처리
      if (isTextVDOMNode(nextChild)) {
        const $textNode = document.createTextNode(nextChild.toString());
        if (
          $el.childNodes[i] &&
          $el.childNodes[i].nodeValue !== $textNode.nodeValue
        ) {
          $el.replaceChild($textNode, $el.childNodes[i]);
        } else if (!$el.childNodes[i]) {
          $el.appendChild($textNode);
        }
      } else {
        // VDOM인 경우 기존 방식대로 처리
        if (!prevChild || nextChild !== prevChild) {
          updateElement($el, nextChild, prevChild);
        }
      }
    }
  }

  nextVDOM.current = $el;
}

/**
 * 두 객체의 깊은 비교를 수행하는 함수
 * @param a - 첫 번째 객체
 * @param b - 두 번째 객체
 * @returns 객체가 깊게 동일하면 true, 그렇지 않으면 false
 */
function deepEquals(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }

  if (
    typeof a !== 'object' ||
    a === null ||
    typeof b !== 'object' ||
    b === null
  ) {
    return false;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const key of aKeys) {
    if (!bKeys.includes(key) || !deepEquals(a[key], b[key])) {
      // 재귀적으로 깊이 비교
      return false;
    }
  }

  return true;
}

/**
 * 부모 DOM 요소의 자식 중 특정 문자열 값을 가진 자식의 인덱스를 반환
 */
function findChildIndexByTextVDOMNode(
  parentElement: HTMLElement | Text,
  targetChild: TextVDOMNode
): number {
  if (!parentElement) return -1;

  const childNodes = parentElement.childNodes;

  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i];

    if (
      child.nodeType === Node.TEXT_NODE &&
      child.nodeValue?.trim() === targetChild
    ) {
      return i;
    }
  }

  return -1;
}
