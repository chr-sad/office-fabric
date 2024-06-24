//https://github.com/microsoft/fluentui/blob/master/packages/react-focus/src/components/FocusZone/FocusZone.tsx

import { FocusZoneDirection, FocusZoneTabbableElements } from './FocusZone.types';
import {
  KeyCodes,
  css,
  elementContains,
  getDocument,
  getElementIndexPath,
  getFocusableByIndexPath,
  getId,
  getNativeProps,
  getNextElement,
  getParent,
  getPreviousElement,
  getRTL,
  htmlElementProperties,
  //initializeComponentRef,
  isElementFocusSubZone,
  isElementFocusZone,
  isElementTabbable,
  shouldWrapFocus,
  //warnDeprecations,
  portalContainsElement,
  findScrollableParent,
  //createMergedRef,
  isElementVisibleAndNotHidden,
  //MergeStylesShadowRootContext,
} from '@fluentui-vue/utilities';
import { mergeStyles } from '@fluentui/merge-styles'
import { getTheme } from '@fluentui-vue/style-utilities'
import type { IFocusZone, IFocusZoneProps } from './FocusZone.types';
import type { Point } from '@fluentui-vue/utilities';
import type { ITheme } from '@fluentui-vue/style-utilities';
import { makeStylingProps } from '../useStyling';
import { defineComponent, getCurrentInstance, h, onMounted, onUnmounted, onUpdated, ref, type Component, type ComponentInstance, type ComponentInternalInstance, type PropType } from 'vue';

const IS_FOCUSABLE_ATTRIBUTE = 'data-is-focusable';
const IS_ENTER_DISABLED_ATTRIBUTE = 'data-disable-click-on-enter';
const FOCUSZONE_ID_ATTRIBUTE = 'data-focuszone-id';
const TABINDEX = 'tabindex';
const NO_VERTICAL_WRAP = 'data-no-vertical-wrap';
const NO_HORIZONTAL_WRAP = 'data-no-horizontal-wrap';
const LARGE_DISTANCE_FROM_CENTER = 999999999;
const LARGE_NEGATIVE_DISTANCE_FROM_CENTER = -999999999;

let focusZoneStyles: string;

const focusZoneClass: string = 'ms-FocusZone';

/**
 * Raises a click on a target element based on a keyboard event.
 */
function raiseClickFromKeyboardEvent(target: Element, ev?: KeyboardEvent): void {
  let event;
  if (typeof MouseEvent === 'function') {
    event = new MouseEvent('click', {
      ctrlKey: ev?.ctrlKey,
      metaKey: ev?.metaKey,
      shiftKey: ev?.shiftKey,
      altKey: ev?.altKey,
      bubbles: ev?.bubbles,
      cancelable: ev?.cancelable,
    });
  } else {
    // eslint-disable-next-line no-restricted-globals
    event = document.createEvent('MouseEvents');
    // eslint-disable-next-line deprecation/deprecation
    event.initMouseEvent(
      'click',
      ev ? ev.bubbles : false,
      ev ? ev.cancelable : false,
      // eslint-disable-next-line no-restricted-globals
      window, // not using getWindow() since this can only be run client side
      0, // detail
      0, // screen x
      0, // screen y
      0, // client x
      0, // client y
      ev ? ev.ctrlKey : false,
      ev ? ev.altKey : false,
      ev ? ev.shiftKey : false,
      ev ? ev.metaKey : false,
      0, // button
      null, // relatedTarget
    );
  }

  target.dispatchEvent(event);
}

// Helper function that will return a class for when the root is focused
function getRootClass(): string {
  if (!focusZoneStyles) {
    focusZoneStyles = mergeStyles(
      {
        selectors: {
          ':focus': {
            outline: 'none',
          },
        },
      },
      focusZoneClass,
    );
  }
  return focusZoneStyles;
}

const _allInstances: { [key: string]: any } = {};
const _outerZones: Set<any> = new Set();

const ALLOWED_INPUT_TYPES = ['text', 'number', 'password', 'email', 'tel', 'url', 'search', 'textarea'];

const ALLOW_VIRTUAL_ELEMENTS = false;

interface IFocusZonePropsWithTabster extends IFocusZoneProps {
  'data-tabster': string;
}

const DEFAULT_PROPS: IFocusZoneProps = {
  isCircularNavigation: false,
  direction: FocusZoneDirection.bidirectional,
  shouldRaiseClicks: true,
  // Hardcoding uncontrolled flag for proper interop with FluentUI V9.
  'data-tabster': '{"uncontrolled": {}}',
} as IFocusZonePropsWithTabster;

export const FocusZone = defineComponent({
  name: 'FocusZone',

  props: {
    ...makeStylingProps(),
    shouldRaiseClicks: { type: Boolean, default: DEFAULT_PROPS.shouldRaiseClicks },
    shouldRaiceClicksOnEnter: { type: Boolean, default: undefined },
    shouldRaiseClicksOnSpace: { type: Boolean, default: undefined },

    isCircularNavigation: { type: Boolean, default: DEFAULT_PROPS.isCircularNavigation },
    checkForNoWrap: { type: Boolean, default: false },
    defaultTabbableElement: { type: Object as PropType<string | ((root: HTMLElement) => HTMLElement)>, default: null },
    defaultActiveElement: { type: String, default: null },
    shouldFocusOnMount: { type: Boolean, default: false },
    preventFocusRestoration: { type: Boolean, default: false },

    onBeforeFocus: { type: Function, default: undefined },
    shouldReceiveFocus: { type: Function, default: undefined },

    onActiveElementChanged: { type: Function, default: undefined },
    doNotAllowFocusEventToPropagate: { type: Boolean, default: false },
    stopFocusPropagation: { type: Boolean, default: false },
    onFocusNotification: { type: Function, default: undefined },
    onFocus: { type: Function, default: undefined },
    shouldFocusInnerElementWhenReceivedFocus: { type: Boolean, default: false },

    allowFocusRoot: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },

    preventDefaultWhenHandled: { type: Boolean, default: true },

    direction: { type: Number as PropType<FocusZoneDirection>, default: DEFAULT_PROPS.direction },
    isInnerZoneKeystroke: { type: Function, default: undefined },
    pagingSupportDisabled: { type: Boolean, default: false },
    shouldEnterInnerZone: { type: Function, default: undefined },

    onKeyDown: { type: Function, default: undefined },

    allowTabKey: { type: Boolean, default: false },
    handleTabKey: { type: Number as PropType<FocusZoneTabbableElements>, default: FocusZoneTabbableElements.all },
    shouldResetActiveElementWhenTabFromZone: { type: Boolean, default: false },

    shouldInputLoseFocusOnArrowKey: { type: Function, default: undefined },

    as: { type: Object as PropType<string | Component>, default: 'div' },

    ariaDescribedBy: { type: String, default: undefined },
    ariaLabelledBy: { type: String, default: undefined },
  },


  setup(props, { attrs, emit, slots, expose }) {
    //const contextType = 'MergeStylesShadowRootContext';

    const _root = ref<HTMLElement | null>(null);
    const _id = getId('FocusZone');

    // The most recently focused child element.
    const _activeElement = ref<HTMLElement | null>(null);

    // The index path to the last focused child element.
    const _lastIndexPath = ref<number[] | undefined>(undefined);

    // Flag to define when we've intentionally parked focus on the root element to temporarily
    // hold focus until items appear within the zone.
    const _isParked = ref(false);

    // The child element with tabindex=0.
    const _defaultFocusElement = ref<HTMLElement | null>(null);
    const _focusAlignment = ref<Point>({ left: 0, top: 0 });
    const _isInnerZone = ref(false);
    const _parkedTabIndex = ref<string | null | undefined>(undefined);

    // Used to allow moving to next focusable element even when we're focusing on a input element when pressing tab
    const _processingTabKey = ref(false);

    // Provides granular control over `shouldRaiseClicks` and should be preferred over `props.shouldRaiseClicks`.
    const shouldRaiseClicksFallback = props.shouldRaiseClicks ?? DEFAULT_PROPS.shouldRaiseClicks ?? true;
    const _shouldRaiseClicksOnEnter = ref(props.shouldRaiceClicksOnEnter ?? shouldRaiseClicksFallback);
    const _shouldRaiseClicksOnSpace = ref(props.shouldRaiseClicksOnSpace ?? shouldRaiseClicksFallback);

    // get current instance
    const _currentInstance = getCurrentInstance();

    ///-----

    /**
     * Handle global tab presses so that we can patch tabindexes on the fly.
     * HEADS UP: This must not be an arrow function in order to be referentially equal among instances
     * for ref counting to work correctly!
     */
    const _onKeyDownCapture = (ev: KeyboardEvent) => {
      // eslint-disable-next-line deprecation/deprecation, @fluentui/deprecated-keyboard-event-props
      if (ev.which === KeyCodes.tab) {
        _outerZones.forEach((zone) => {
          zone.exposed.updateTabIndexes()
        });
      }
    }

    onMounted(() => {
      const rootElement = _root.value;

      _allInstances[_id] = _currentInstance;
      if (rootElement) {
        let parentElement = getParent(rootElement, ALLOW_VIRTUAL_ELEMENTS);

        while (parentElement && parentElement !== _getDocument().body && parentElement.nodeType === 1) {
          if (isElementFocusZone(parentElement)) {
            _isInnerZone.value = true;
            break;
          }
          parentElement = getParent(parentElement, ALLOW_VIRTUAL_ELEMENTS);
        }

        if (!_isInnerZone.value) {
          _outerZones.add(_currentInstance);

          rootElement.addEventListener('keydown', _onKeyDownCapture, true);
        }

        rootElement.addEventListener('blur', _onBlur, true);

        _updateTabIndexes();

        if (props.defaultTabbableElement && typeof props.defaultTabbableElement === 'string') {
          _activeElement.value = _getDocument().querySelector(props.defaultTabbableElement);
        } else if (props.defaultActiveElement) {
          _activeElement.value = _getDocument().querySelector(props.defaultActiveElement);
        }

        if (props.shouldFocusOnMount) {
          focus();
        }
      }
    });

    onUpdated(() => {
      const rootElement = _root.value;
      if(!rootElement) return;

      const doc = _getDocument();

      if (
        (_activeElement.value && !elementContains(rootElement, _activeElement.value, ALLOW_VIRTUAL_ELEMENTS)) ||
        (_defaultFocusElement.value &&
          !elementContains(rootElement, _defaultFocusElement.value, ALLOW_VIRTUAL_ELEMENTS))
      ) {
        _activeElement.value = null;
        _defaultFocusElement.value = null;
        _updateTabIndexes();
      }

      if (
        !props.preventFocusRestoration &&
        doc &&
        _lastIndexPath.value &&
        (doc.activeElement === doc.body || doc.activeElement === null || doc.activeElement === rootElement)
      ) {
        const elementToFocus = getFocusableByIndexPath(rootElement, _lastIndexPath.value);

        if (elementToFocus) {
          _setActiveElement(elementToFocus, true);
          elementToFocus.focus();
          _setParkedFocus(false);
        } else {
          _setParkedFocus(true);
        }
      }
    });

    onUnmounted(() => {
      delete _allInstances[_id];

      if (!_isInnerZone.value) {
        _outerZones.delete(_currentInstance);

        _root.value && _root.value.removeEventListener('keydown', _onKeyDownCapture, true);
      }

      if (_root.value) {
        _root.value.removeEventListener('blur', _onBlur, true);
      }

      _activeElement.value = null;
      _defaultFocusElement.value = null;
    });

    /**
     * Sets focus to the first tabbable item in the zone.
     * @param forceIntoFirstElement - If true, focus will be forced into the first element, even
     * if focus is already in the focus zone.
     * @param bypassHiddenElements - If true, focus will be not be set on hidden elements.
     * @returns True if focus could be set to an active element, false if no operation was taken.
     */
    const focus = (forceIntoFirstElement: boolean = false, bypassHiddenElements: boolean = false) => {
      if (_root.value) {
        if (
          !forceIntoFirstElement &&
          _root.value.getAttribute(IS_FOCUSABLE_ATTRIBUTE) === 'true' &&
          _isInnerZone
        ) {
          const ownerZoneElement = _getOwnerZone(_root.value) as HTMLElement;

          if (ownerZoneElement !== _root.value) {
            const ownerZone = _allInstances[ownerZoneElement.getAttribute(FOCUSZONE_ID_ATTRIBUTE) as string];

            return !!ownerZone && ownerZone.focusElement(_root.value);
          }

          return false;
        } else if (
          !forceIntoFirstElement &&
          _activeElement.value &&
          elementContains(_root.value, _activeElement.value) &&
          isElementTabbable(_activeElement.value, undefined) &&
          (!bypassHiddenElements || isElementVisibleAndNotHidden(_activeElement.value))
        ) {
          _activeElement.value.focus();
          return true;
        } else {
          const firstChild = _root.value.firstChild as HTMLElement;

          return focusElement(
            getNextElement(
              _root.value,
              firstChild,
              true,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              bypassHiddenElements,
            ) as HTMLElement,
          );
        }
      }
      return false;
    }

    /**
     * Sets focus to the last tabbable item in the zone.
     * @returns True if focus could be set to an active element, false if no operation was taken.
     */
    const focusLast = () => {
      if (_root.value) {
        const lastChild = _root.value && (_root.value.lastChild as HTMLElement | null);

        return focusElement(getPreviousElement(_root.value, lastChild, true, true, true) as HTMLElement);
      }

      return false;
    }

    /**
     * Sets focus to a specific child element within the zone. This can be used in conjunction with
     * shouldReceiveFocus to create delayed focus scenarios (like animate the scroll position to the correct
     * location and then focus.)
     * @param element - The child element within the zone to focus.
     * @param forceAlignment - If true, focus alignment will be set according to the element provided.
     * @returns True if focus could be set to an active element, false if no operation was taken.
     */
    const focusElement = (element: HTMLElement, forceAlignment?: boolean) => {
      // eslint-disable-next-line deprecation/deprecation
      const { onBeforeFocus, shouldReceiveFocus } = props;

      if ((shouldReceiveFocus && !shouldReceiveFocus(element)) || (onBeforeFocus && !onBeforeFocus(element))) {
        return false;
      }

      if (element) {
        // when we set focus to a specific child, we should recalculate the alignment depending on its position.
        _setActiveElement(element, forceAlignment);
        if (_activeElement.value) {
          _activeElement.value.focus();
        }

        return true;
      }

      return false;
    }

    /**
     * Forces horizontal alignment in the context of vertical arrowing to use specific point as the reference,
     * rather than a center based on the last horizontal motion.
     * @param point - the new reference point.
     */
    const setFocusAlignment = (point: Point) => {
      _focusAlignment.value = point;
    }
  
    const _evaluateFocusBeforeRender = () => {
      const { value: root } = _root;

      const doc = _getDocument();
      if (doc) {
        const focusedElement = doc.activeElement as HTMLElement;

        // Only update the index path if we are not parked on the root.
        if (focusedElement !== root) {
          const shouldRestoreFocus = elementContains(root, focusedElement, false);
          _lastIndexPath.value = shouldRestoreFocus ? getElementIndexPath(root as HTMLElement, focusedElement) : undefined;
        }
      }
    }

    const _onFocus = (ev: FocusEvent): void => {
      if (_portalContainsElement(ev.target as HTMLElement)) {
        // If the event target is inside a portal do not process the event.
        return;
      }

      const {
        onActiveElementChanged,
        // eslint-disable-next-line deprecation/deprecation
        doNotAllowFocusEventToPropagate,
        stopFocusPropagation,
        // eslint-disable-next-line deprecation/deprecation
        onFocusNotification,
        onFocus,
        shouldFocusInnerElementWhenReceivedFocus,
        defaultTabbableElement,
      } = props;
      const isImmediateDescendant = _isImmediateDescendantOfZone(ev.target as HTMLElement);
      let newActiveElement: HTMLElement | null | undefined;

      if (isImmediateDescendant) {
        newActiveElement = ev.target as HTMLElement;
      } else {
        let parentElement = ev.target as HTMLElement;

        while (parentElement && parentElement !== _root.value) {
          if (
            isElementTabbable(parentElement, undefined) &&
            _isImmediateDescendantOfZone(parentElement)
          ) {
            newActiveElement = parentElement;
            break;
          }
          parentElement = getParent(parentElement, ALLOW_VIRTUAL_ELEMENTS) as HTMLElement;
        }
      }

      // If an inner focusable element should be focused when FocusZone container receives focus
      if (shouldFocusInnerElementWhenReceivedFocus && ev.target === _root.value) {
        const maybeElementToFocus =
          defaultTabbableElement &&
          typeof defaultTabbableElement === 'function' &&
          _root.value &&
          defaultTabbableElement(_root.value);

        // try to focus defaultTabbable element
        if (maybeElementToFocus && isElementTabbable(maybeElementToFocus, undefined)) {
          newActiveElement = maybeElementToFocus;
          maybeElementToFocus.focus();
        } else {
          // force focus on first focusable element
          focus(true);
          if (_activeElement.value) {
            // set to null as new active element was handled in method above
            newActiveElement = null;
          }
        }
      }

      const initialElementFocused = !_activeElement.value;

      // If the new active element is a child of this zone and received focus,
      // update alignment an immediate descendant
      if (newActiveElement && newActiveElement !== _activeElement.value) {
        if (isImmediateDescendant || initialElementFocused) {
          _setFocusAlignment(newActiveElement, true, true);
        }

        _activeElement.value = newActiveElement;

        if (initialElementFocused) {
          _updateTabIndexes();
        }
      }

      if (onActiveElementChanged) {
        onActiveElementChanged(_activeElement.value as HTMLElement, ev);
      }

      if (stopFocusPropagation || doNotAllowFocusEventToPropagate) {
        ev.stopPropagation();
      }

      if (onFocus) {
        onFocus(ev);
      } else if (onFocusNotification) {
        onFocusNotification();
      }
    };

    /**
     * When focus is in the zone at render time but then all focusable elements are removed,
     * we "park" focus temporarily on the root. Once we update with focusable children, we restore
     * focus to the closest path from previous. If the user tabs away from the parked container,
     * we restore focusability to the pre-parked state.
     */
    const _setParkedFocus = (isParked: boolean) =>  {
      const { value: root } = _root;

      if (root && _isParked.value !== isParked) {
        _isParked.value = isParked;

        if (isParked) {
          if (!props.allowFocusRoot) {
            _parkedTabIndex.value = root.getAttribute('tabindex');
            root.setAttribute('tabindex', '-1');
          }
          root.focus();
        } else if (!props.allowFocusRoot) {
          if (_parkedTabIndex.value) {
            root.setAttribute('tabindex', _parkedTabIndex.value);
            _parkedTabIndex.value = undefined;
          } else {
            root.removeAttribute('tabindex');
          }
        }
      }
    }

    const _onBlur = () => {
      _setParkedFocus(false);
    };

    const _onMouseDown = (ev: MouseEvent) => {
      if (_portalContainsElement(ev.target as HTMLElement)) {
        // If the event target is inside a portal do not process the event.
        return;
      }

      const { disabled } = props;

      if (disabled) {
        return;
      }

      let target = ev.target as HTMLElement;
      const path:any[] = [];

      while (target && target !== _root.value) {
        path.push(target);
        target = getParent(target, ALLOW_VIRTUAL_ELEMENTS) as HTMLElement;
      }

      while (path.length) {
        target = path.pop() as HTMLElement;

        if (target && isElementTabbable(target, undefined)) {
          _setActiveElement(target, true);
        }

        if (isElementFocusZone(target)) {
          // Stop here since the focus zone will take care of its own children.
          break;
        }
      }
    };

    const _setActiveElement = (element: HTMLElement, forceAlignment?: boolean): void => {
      const previousActiveElement = _activeElement.value;

      _activeElement.value = element;

      if (previousActiveElement) {
        if (isElementFocusZone(previousActiveElement)) {
          _updateTabIndexes(previousActiveElement);
        }

        previousActiveElement.tabIndex = -1;
      }

      if (_activeElement.value) {
        if (!_focusAlignment.value || forceAlignment) {
          _setFocusAlignment(element, true, true);
        }

        _activeElement.value.tabIndex = 0;
      }
    }

    const _preventDefaultWhenHandled = (ev: KeyboardEvent): void => {
      props.preventDefaultWhenHandled && ev.preventDefault();
    }

    /**
     * Handle the keystrokes.
     */
    const _onKeyDown = (ev: KeyboardEvent, theme: ITheme): boolean | undefined => {
      if (_portalContainsElement(ev.target as HTMLElement)) {
        // If the event target is inside a portal do not process the event.
        return;
      }

      // eslint-disable-next-line deprecation/deprecation
      const { direction, disabled, isInnerZoneKeystroke, pagingSupportDisabled, shouldEnterInnerZone } = props;

      if (disabled) {
        return;
      }

      if (props.onKeyDown) {
        props.onKeyDown(ev);
      }

      // If the default has been prevented, do not process keyboard events.
      if (ev.defaultPrevented) {
        return;
      }

      if (_getDocument().activeElement === _root.value && _isInnerZone.value) {
        // If this element has focus, it is being controlled by a parent.
        // Ignore the keystroke.
        return;
      }

      if (
        ((shouldEnterInnerZone && shouldEnterInnerZone(ev)) || (isInnerZoneKeystroke && isInnerZoneKeystroke(ev))) &&
        _isImmediateDescendantOfZone(ev.target as HTMLElement)
      ) {
        // Try to focus
        const innerZone = _getFirstInnerZone();

        if (innerZone) {
          if (!innerZone.focus(true)) {
            return;
          }
        } else if (isElementFocusSubZone(ev.target as HTMLElement)) {
          if (
            !focusElement(
              getNextElement(
                ev.target as HTMLElement,
                (ev.target as HTMLElement).firstChild as HTMLElement,
                true,
              ) as HTMLElement,
            )
          ) {
            return;
          }
        } else {
          return;
        }
      } else if (ev.altKey) {
        return;
      } else {
        // eslint-disable-next-line @fluentui/deprecated-keyboard-event-props, deprecation/deprecation
        switch (ev.which) {
          case KeyCodes.space:
            if (_shouldRaiseClicksOnSpace.value && _tryInvokeClickForFocusable(ev.target as HTMLElement, ev)) {
              break;
            }
            return;

          case KeyCodes.left:
            if (direction !== FocusZoneDirection.vertical) {
              _preventDefaultWhenHandled(ev);
              if (_moveFocusLeft(theme)) {
                break;
              }
            }
            return;

          case KeyCodes.right:
            if (direction !== FocusZoneDirection.vertical) {
              _preventDefaultWhenHandled(ev);
              if (_moveFocusRight(theme)) {
                break;
              }
            }
            return;

          case KeyCodes.up:
            if (direction !== FocusZoneDirection.horizontal) {
              _preventDefaultWhenHandled(ev);
              if (_moveFocusUp()) {
                break;
              }
            }
            return;

          case KeyCodes.down:
            if (direction !== FocusZoneDirection.horizontal) {
              _preventDefaultWhenHandled(ev);
              if (_moveFocusDown()) {
                break;
              }
            }
            return;
          case KeyCodes.pageDown:
            if (!pagingSupportDisabled && _moveFocusPaging(true)) {
              break;
            }
            return;
          case KeyCodes.pageUp:
            if (!pagingSupportDisabled && _moveFocusPaging(false)) {
              break;
            }
            return;

          case KeyCodes.tab:
            if (
              // eslint-disable-next-line deprecation/deprecation
              props.allowTabKey ||
              props.handleTabKey === FocusZoneTabbableElements.all ||
              (props.handleTabKey === FocusZoneTabbableElements.inputOnly &&
                _isElementInput(ev.target as HTMLElement))
            ) {
              let focusChanged = false;
              _processingTabKey.value = true;
              if (
                direction === FocusZoneDirection.vertical ||
                !_shouldWrapFocus(_activeElement.value as HTMLElement, NO_HORIZONTAL_WRAP)
              ) {
                focusChanged = ev.shiftKey ? _moveFocusUp() : _moveFocusDown();
              } else {
                const tabWithDirection = getRTL(theme) ? !ev.shiftKey : ev.shiftKey;
                focusChanged = tabWithDirection ? _moveFocusLeft(theme) : _moveFocusRight(theme);
              }
              _processingTabKey.value = false;
              if (focusChanged) {
                break;
              } else if (props.shouldResetActiveElementWhenTabFromZone) {
                _activeElement.value = null;
              }
            }
            return;

          case KeyCodes.home:
            if (
              _isContentEditableElement(ev.target as HTMLElement) ||
              (_isElementInput(ev.target as HTMLElement) &&
                !_shouldInputLoseFocus(ev.target as HTMLInputElement, false))
            ) {
              return false;
            }
            const firstChild = _root.value && (_root.value.firstChild as HTMLElement | null);
            if (
              _root.value &&
              firstChild &&
              focusElement(getNextElement(_root.value, firstChild, true) as HTMLElement)
            ) {
              break;
            }
            return;

          case KeyCodes.end:
            if (
              _isContentEditableElement(ev.target as HTMLElement) ||
              (_isElementInput(ev.target as HTMLElement) &&
                !_shouldInputLoseFocus(ev.target as HTMLInputElement, true))
            ) {
              return false;
            }

            const lastChild = _root.value && (_root.value.lastChild as HTMLElement | null);
            if (
              _root.value &&
              focusElement(getPreviousElement(_root.value, lastChild, true, true, true) as HTMLElement)
            ) {
              break;
            }
            return;

          case KeyCodes.enter:
            if (_shouldRaiseClicksOnEnter && _tryInvokeClickForFocusable(ev.target as HTMLElement, ev)) {
              break;
            }
            return;

          default:
            return;
        }
      }

      ev.preventDefault();
      ev.stopPropagation();
    };

    /**
     * Walk up the dom try to find a focusable element.
     */
    const _tryInvokeClickForFocusable = (targetElement: HTMLElement, ev?: KeyboardEvent): boolean => {
      let target = targetElement;
      if (target === _root.value) {
        return false;
      }

      do {
        if (
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SUMMARY'
        ) {
          return false;
        }

        if (
          _isImmediateDescendantOfZone(target) &&
          target.getAttribute(IS_FOCUSABLE_ATTRIBUTE) === 'true' &&
          target.getAttribute(IS_ENTER_DISABLED_ATTRIBUTE) !== 'true'
        ) {
          raiseClickFromKeyboardEvent(target, ev);
          return true;
        }

        target = getParent(target, ALLOW_VIRTUAL_ELEMENTS) as HTMLElement;
      } while (target !== _root.value);

      return false;
    }

    /**
     * Traverse to find first child zone.
     */
    const _getFirstInnerZone = (rootElement?: HTMLElement | null): typeof FocusZone | null => {
      rootElement = rootElement || _activeElement.value || _root.value;

      if (!rootElement) {
        return null;
      }

      if (isElementFocusZone(rootElement)) {
        return _allInstances[rootElement.getAttribute(FOCUSZONE_ID_ATTRIBUTE) as string];
      }

      let child = rootElement.firstElementChild as HTMLElement | null;

      while (child) {
        if (isElementFocusZone(child)) {
          return _allInstances[child.getAttribute(FOCUSZONE_ID_ATTRIBUTE) as string];
        }
        const match = _getFirstInnerZone(child);

        if (match) {
          return match;
        }

        child = child.nextElementSibling as HTMLElement | null;
      }

      return null;
    }

    const _moveFocus = (
      isForward: boolean,
      // eslint-disable-next-line deprecation/deprecation
      getDistanceFromCenter: (activeRect: ClientRect, targetRect: ClientRect) => number,
      ev?: Event,
      useDefaultWrap: boolean = true,
    ): boolean => {
      let element = _activeElement.value;
      let candidateDistance = -1;
      let candidateElement: HTMLElement | undefined = undefined;
      let changedFocus = false;
      const isBidirectional = props.direction === FocusZoneDirection.bidirectional;

      if (!element || !_root.value) {
        return false;
      }

      if (_isElementInput(element)) {
        if (!_shouldInputLoseFocus(element as HTMLInputElement, isForward)) {
          return false;
        }
      }

      const activeRect = isBidirectional ? element.getBoundingClientRect() : null;

      do {
        element = (
          isForward ? getNextElement(_root.value, element) : getPreviousElement(_root.value, element)
        ) as HTMLElement;

        if (isBidirectional) {
          if (element) {
            const targetRect = element.getBoundingClientRect();
            // eslint-disable-next-line deprecation/deprecation
            const elementDistance = getDistanceFromCenter(activeRect as ClientRect, targetRect);

            if (elementDistance === -1 && candidateDistance === -1) {
              candidateElement = element;
              break;
            }

            if (elementDistance > -1 && (candidateDistance === -1 || elementDistance < candidateDistance)) {
              candidateDistance = elementDistance;
              candidateElement = element;
            }

            if (candidateDistance >= 0 && elementDistance < 0) {
              break;
            }
          }
        } else {
          candidateElement = element;
          break;
        }
      } while (element);

      // Focus the closest candidate
      if (candidateElement && candidateElement !== _activeElement.value) {
        changedFocus = true;
        focusElement(candidateElement);
      } else if (props.isCircularNavigation && useDefaultWrap) {
        if (isForward) {
          return focusElement(
            getNextElement(_root.value, _root.value.firstElementChild as HTMLElement, true) as HTMLElement,
          );
        } else {
          return focusElement(
            getPreviousElement(
              _root.value,
              _root.value.lastElementChild as HTMLElement,
              true,
              true,
              true,
            ) as HTMLElement,
          );
        }
      }

      return changedFocus;
    }

    const _moveFocusDown = (): boolean => {
      let targetTop = -1;
      // eslint-disable-next-line deprecation/deprecation
      const leftAlignment = _focusAlignment.value?.left || _focusAlignment.value?.x || 0;

      if (
        // eslint-disable-next-line deprecation/deprecation
        _moveFocus(true, (activeRect: ClientRect, targetRect: ClientRect) => {
          let distance = -1;
          // ClientRect values can be floats that differ by very small fractions of a decimal.
          // If the difference between top and bottom are within a pixel then we should treat
          // them as equivalent by using Math.floor. For instance 5.2222 and 5.222221 should be equivalent,
          // but without Math.Floor they will be handled incorrectly.
          const targetRectTop = Math.floor(targetRect.top);
          const activeRectBottom = Math.floor(activeRect.bottom);

          if (targetRectTop < activeRectBottom) {
            if (!_shouldWrapFocus(_activeElement.value as HTMLElement, NO_VERTICAL_WRAP)) {
              return LARGE_NEGATIVE_DISTANCE_FROM_CENTER;
            }

            return LARGE_DISTANCE_FROM_CENTER;
          }

          if ((targetTop === -1 && targetRectTop >= activeRectBottom) || targetRectTop === targetTop) {
            targetTop = targetRectTop;
            if (leftAlignment >= targetRect.left && leftAlignment <= targetRect.left + targetRect.width) {
              distance = 0;
            } else {
              distance = Math.abs(targetRect.left + targetRect.width / 2 - leftAlignment);
            }
          }

          return distance;
        })
      ) {
        _setFocusAlignment(_activeElement.value as HTMLElement, false, true);
        return true;
      }

      return false;
    }

    const _moveFocusUp = (): boolean => {
      let targetTop = -1;
      // eslint-disable-next-line deprecation/deprecation
      const leftAlignment = _focusAlignment.value?.left || _focusAlignment.value?.x || 0;

      if (
        // eslint-disable-next-line deprecation/deprecation
        _moveFocus(false, (activeRect: ClientRect, targetRect: ClientRect) => {
          let distance = -1;
          // ClientRect values can be floats that differ by very small fractions of a decimal.
          // If the difference between top and bottom are within a pixel then we should treat
          // them as equivalent by using Math.floor. For instance 5.2222 and 5.222221 should be equivalent,
          // but without Math.Floor they will be handled incorrectly.
          const targetRectBottom = Math.floor(targetRect.bottom);
          const targetRectTop = Math.floor(targetRect.top);
          const activeRectTop = Math.floor(activeRect.top);

          if (targetRectBottom > activeRectTop) {
            if (!_shouldWrapFocus(_activeElement.value as HTMLElement, NO_VERTICAL_WRAP)) {
              return LARGE_NEGATIVE_DISTANCE_FROM_CENTER;
            }
            return LARGE_DISTANCE_FROM_CENTER;
          }

          if ((targetTop === -1 && targetRectBottom <= activeRectTop) || targetRectTop === targetTop) {
            targetTop = targetRectTop;
            if (leftAlignment >= targetRect.left && leftAlignment <= targetRect.left + targetRect.width) {
              distance = 0;
            } else {
              distance = Math.abs(targetRect.left + targetRect.width / 2 - leftAlignment);
            }
          }

          return distance;
        })
      ) {
        _setFocusAlignment(_activeElement.value as HTMLElement, false, true);
        return true;
      }

      return false;
    }

    const _moveFocusLeft = (theme: ITheme): boolean => {
      const shouldWrap = _shouldWrapFocus(_activeElement.value as HTMLElement, NO_HORIZONTAL_WRAP);
      if (
        _moveFocus(
          getRTL(theme),
          // eslint-disable-next-line deprecation/deprecation
          (activeRect: ClientRect, targetRect: ClientRect) => {
            let distance = -1;
            let topBottomComparison;

            if (getRTL(theme)) {
              // When in RTL, this comparison should be the same as the one in _moveFocusRight for LTR.
              // Going left at a leftmost rectangle will go down a line instead of up a line like in LTR.
              // This is important, because we want to be comparing the top of the target rect
              // with the bottom of the active rect.
              topBottomComparison = parseFloat(targetRect.top.toFixed(3)) < parseFloat(activeRect.bottom.toFixed(3));
            } else {
              topBottomComparison = parseFloat(targetRect.bottom.toFixed(3)) > parseFloat(activeRect.top.toFixed(3));
            }

            if (
              topBottomComparison &&
              targetRect.right <= activeRect.right &&
              props.direction !== FocusZoneDirection.vertical
            ) {
              distance = activeRect.right - targetRect.right;
            } else if (!shouldWrap) {
              distance = LARGE_NEGATIVE_DISTANCE_FROM_CENTER;
            }

            return distance;
          },
          undefined /*ev*/,
          shouldWrap,
        )
      ) {
        _setFocusAlignment(_activeElement.value as HTMLElement, true, false);
        return true;
      }

      return false;
    }

    const _moveFocusRight = (theme: ITheme): boolean => {
      const shouldWrap = _shouldWrapFocus(_activeElement.value as HTMLElement, NO_HORIZONTAL_WRAP);
      if (
        _moveFocus(
          !getRTL(theme),
          // eslint-disable-next-line deprecation/deprecation
          (activeRect: ClientRect, targetRect: ClientRect) => {
            let distance = -1;
            let topBottomComparison;

            if (getRTL(theme)) {
              // When in RTL, this comparison should be the same as the one in _moveFocusLeft for LTR.
              // Going right at a rightmost rectangle will go up a line instead of down a line like in LTR.
              // This is important, because we want to be comparing the bottom of the target rect
              // with the top of the active rect.
              topBottomComparison = parseFloat(targetRect.bottom.toFixed(3)) > parseFloat(activeRect.top.toFixed(3));
            } else {
              topBottomComparison = parseFloat(targetRect.top.toFixed(3)) < parseFloat(activeRect.bottom.toFixed(3));
            }

            if (
              topBottomComparison &&
              targetRect.left >= activeRect.left &&
              props.direction !== FocusZoneDirection.vertical
            ) {
              distance = targetRect.left - activeRect.left;
            } else if (!shouldWrap) {
              distance = LARGE_NEGATIVE_DISTANCE_FROM_CENTER;
            }

            return distance;
          },
          undefined /*ev*/,
          shouldWrap,
        )
      ) {
        _setFocusAlignment(_activeElement.value as HTMLElement, true, false);
        return true;
      }

      return false;
    }

    const _getHorizontalDistanceFromCenter = (
      isForward: boolean,
      // eslint-disable-next-line deprecation/deprecation
      activeRect: ClientRect,
      // eslint-disable-next-line deprecation/deprecation
      targetRect: ClientRect,
    ): number => {
      // eslint-disable-next-line deprecation/deprecation
      const leftAlignment = _focusAlignment.value?.left || _focusAlignment.value?.x || 0;
      // ClientRect values can be floats that differ by very small fractions of a decimal.
      // If the difference between top and bottom are within a pixel then we should treat
      // them as equivalent by using Math.floor. For instance 5.2222 and 5.222221 should be equivalent,
      // but without Math.Floor they will be handled incorrectly.
      const targetRectTop = Math.floor(targetRect.top);
      const activeRectBottom = Math.floor(activeRect.bottom);
      const targetRectBottom = Math.floor(targetRect.bottom);
      const activeRectTop = Math.floor(activeRect.top);
      const isValidCandidateOnpagingDown = isForward && targetRectTop > activeRectBottom;
      const isValidCandidateOnpagingUp = !isForward && targetRectBottom < activeRectTop;

      if (isValidCandidateOnpagingDown || isValidCandidateOnpagingUp) {
        if (leftAlignment >= targetRect.left && leftAlignment <= targetRect.left + targetRect.width) {
          return 0;
        }
        return Math.abs(targetRect.left + targetRect.width / 2 - leftAlignment);
      }

      if (!_shouldWrapFocus(_activeElement.value as HTMLElement, NO_VERTICAL_WRAP)) {
        return LARGE_NEGATIVE_DISTANCE_FROM_CENTER;
      }
      return LARGE_DISTANCE_FROM_CENTER;
    };

    const _moveFocusPaging = (isForward: boolean, useDefaultWrap: boolean = true): boolean => {
      let element = _activeElement.value;
      if (!element || !_root.value) {
        return false;
      }
      if (_isElementInput(element)) {
        if (!_shouldInputLoseFocus(element as HTMLInputElement, isForward)) {
          return false;
        }
      }
      const scrollableParent = findScrollableParent(element);
      if (!scrollableParent) {
        return false;
      }
      let candidateDistance = -1;
      let candidateElement:HTMLElement|undefined = undefined;
      let targetTop = -1;
      let targetBottom = -1;
      const pagesize = (scrollableParent as HTMLElement).clientHeight;
      const activeRect = element.getBoundingClientRect();
      do {
        element = isForward
          ? getNextElement(_root.value, element)
          : getPreviousElement(_root.value, element);
        if (element) {
          const targetRect = element.getBoundingClientRect();
          const targetRectTop = Math.floor(targetRect.top);
          const activeRectBottom = Math.floor(activeRect.bottom);
          const targetRectBottom = Math.floor(targetRect.bottom);
          const activeRectTop = Math.floor(activeRect.top);
          const elementDistance = _getHorizontalDistanceFromCenter(isForward, activeRect, targetRect);
          const isElementPassedPageSizeOnPagingDown = isForward && targetRectTop > activeRectBottom + pagesize;
          const isElementPassedPageSizeOnPagingUp = !isForward && targetRectBottom < activeRectTop - pagesize;

          if (isElementPassedPageSizeOnPagingDown || isElementPassedPageSizeOnPagingUp) {
            break;
          }
          if (elementDistance > -1) {
            // for paging down
            if (isForward && targetRectTop > targetTop) {
              targetTop = targetRectTop;
              candidateDistance = elementDistance;
              candidateElement = element;
            } else if (!isForward && targetRectBottom < targetBottom) {
              // for paging up
              targetBottom = targetRectBottom;
              candidateDistance = elementDistance;
              candidateElement = element;
            } else if (candidateDistance === -1 || elementDistance <= candidateDistance) {
              candidateDistance = elementDistance;
              candidateElement = element;
            }
          }
        }
      } while (element);

      let changedFocus = false;
      // Focus the closest candidate
      if (candidateElement && candidateElement !== _activeElement.value) {
        changedFocus = true;
        focusElement(candidateElement);
        _setFocusAlignment(candidateElement as HTMLElement, false, true);
      } else if (props.isCircularNavigation && useDefaultWrap) {
        if (isForward) {
          return focusElement(
            getNextElement(_root.value, _root.value.firstElementChild as HTMLElement, true) as HTMLElement,
          );
        }
        return focusElement(
          getPreviousElement(
            _root.value,
            _root.value.lastElementChild as HTMLElement,
            true,
            true,
            true,
          ) as HTMLElement,
        );
      }
      return changedFocus;
    }

    const _setFocusAlignment = (element: HTMLElement, isHorizontal?: boolean, isVertical?: boolean): void => {
      if (
        props.direction === FocusZoneDirection.bidirectional &&
        (!_focusAlignment.value || isHorizontal || isVertical)
      ) {
        const rect = element.getBoundingClientRect();
        const left = rect.left + rect.width / 2;
        const top = rect.top + rect.height / 2;

        if (!_focusAlignment.value) {
          _focusAlignment.value = { left, top };
        }

        if (isHorizontal) {
          _focusAlignment.value.left = left;
        }

        if (isVertical) {
          _focusAlignment.value.top = top;
        }
      }
    }

    const _isImmediateDescendantOfZone = (element?: HTMLElement): boolean => {
      return _getOwnerZone(element) === _root.value;
    }

    const _getOwnerZone = (element?: HTMLElement): HTMLElement | null => {
      let parentElement = getParent(element as HTMLElement, ALLOW_VIRTUAL_ELEMENTS);

      while (parentElement && parentElement !== _root.value && parentElement !== _getDocument().body) {
        if (isElementFocusZone(parentElement)) {
          return parentElement;
        }

        parentElement = getParent(parentElement, ALLOW_VIRTUAL_ELEMENTS);
      }

      return parentElement;
    }

    const _updateTabIndexes = (element?: HTMLElement): void => {
      if (
        !_activeElement.value &&
        props.defaultTabbableElement &&
        typeof props.defaultTabbableElement === 'function'
      ) {
        _activeElement.value = props.defaultTabbableElement(_root.value as HTMLElement);
      }

      if (!element && _root.value) {
        _defaultFocusElement.value = null;
        element = _root.value;
        if (_activeElement.value && !elementContains(element, _activeElement.value)) {
          _activeElement.value = null;
        }
      }

      // If active element changes state to disabled, set it to null.
      // Otherwise, we lose keyboard accessibility to other elements in focus zone.
      if (_activeElement.value && !isElementTabbable(_activeElement.value, undefined)) {
        _activeElement.value = null;
      }

      const childNodes = element && element.children;

      for (let childIndex = 0; childNodes && childIndex < childNodes.length; childIndex++) {
        const child = childNodes[childIndex] as HTMLElement;

        if (!isElementFocusZone(child)) {
          // If the item is explicitly set to not be focusable then TABINDEX needs to be set to -1.
          if (child.getAttribute && child.getAttribute(IS_FOCUSABLE_ATTRIBUTE) === 'false') {
            child.setAttribute(TABINDEX, '-1');
          }

          if (isElementTabbable(child, undefined)) {
            if (props.disabled) {
              child.setAttribute(TABINDEX, '-1');
            } else if (
              !_isInnerZone &&
              ((!_activeElement.value && !_defaultFocusElement.value) || _activeElement.value === child)
            ) {
              _defaultFocusElement.value = child;
              if (child.getAttribute(TABINDEX) !== '0') {
                child.setAttribute(TABINDEX, '0');
              }
            } else if (child.getAttribute(TABINDEX) !== '-1') {
              child.setAttribute(TABINDEX, '-1');
            }
          } else if (child.tagName === 'svg' && child.getAttribute('focusable') !== 'false') {
            // Disgusting IE hack. Sad face.
            child.setAttribute('focusable', 'false');
          }
        } else if (child.getAttribute(IS_FOCUSABLE_ATTRIBUTE) === 'true') {
          if (
            !_isInnerZone &&
            ((!_activeElement.value && !_defaultFocusElement.value) || _activeElement.value === child)
          ) {
            _defaultFocusElement.value = child;
            if (child.getAttribute(TABINDEX) !== '0') {
              child.setAttribute(TABINDEX, '0');
            }
          } else if (child.getAttribute(TABINDEX) !== '-1') {
            child.setAttribute(TABINDEX, '-1');
          }
        }

        _updateTabIndexes(child);
      }
    }

    const _isContentEditableElement = (element: HTMLElement): boolean => {
      return element && element.getAttribute('contenteditable') === 'true';
    }

    const _isElementInput = (element: HTMLElement): boolean => {
      if (
        element &&
        element.tagName &&
        (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea')
      ) {
        return true;
      }
      return false;
    }

    const _shouldInputLoseFocus = (element: HTMLInputElement | HTMLTextAreaElement, isForward?: boolean): boolean => {
      // If a tab was used, we want to focus on the next element.
      if (
        !_processingTabKey.value &&
        element &&
        element.type &&
        ALLOWED_INPUT_TYPES.indexOf(element.type.toLowerCase()) > -1
      ) {
        const selectionStart = element.selectionStart;
        const selectionEnd = element.selectionEnd;
        const isRangeSelected = selectionStart !== selectionEnd;
        const inputValue = element.value;
        const isReadonly = element.readOnly;

        // We shouldn't lose focus in the following cases:
        // 1. There is range selected.
        // 2. When selection start is larger than 0 and it is backward and not readOnly.
        // 3. when selection start is not the end of length, it is forward and not readOnly.
        // 4. We press any of the arrow keys when our handleTabKey isn't none or undefined (only losing focus if we hit
        // tab) and if shouldInputLoseFocusOnArrowKey is defined, if scenario prefers to not loose the focus which is
        // determined by calling the callback shouldInputLoseFocusOnArrowKey
        if (
          isRangeSelected ||
          (selectionStart! > 0 && !isForward && !isReadonly) ||
          (selectionStart !== inputValue.length && isForward && !isReadonly) ||
          (!!props.handleTabKey &&
            !(props.shouldInputLoseFocusOnArrowKey && props.shouldInputLoseFocusOnArrowKey(element)))
        ) {
          return false;
        }
      }

      return true;
    }

    const _shouldWrapFocus = (
      element: HTMLElement,
      noWrapDataAttribute: 'data-no-vertical-wrap' | 'data-no-horizontal-wrap',
    ) => {
      return props.checkForNoWrap ? shouldWrapFocus(element, noWrapDataAttribute) : true;
    }

    /**
     * Returns true if the element is a descendant of the FocusZone through a React portal.
     */
    const _portalContainsElement = (element: HTMLElement) => {
      return element && !!_root.value && portalContainsElement(element, _root.value);
    }

    const _getDocument = () => {
      return getDocument(_root.value)!;
    }

    ///-----

    expose({
      updateTabIndexes: _updateTabIndexes
    })

    ///-----
    // render
    return () => {
      // Destructure the props
      const { as: tag, ariaDescribedBy, ariaLabelledBy, className } = props;
    
      // Compute the tag to use
      const Tag = tag || 'div';
  
      // Get native HTML attributes and properties
      const divProps = getNativeProps(props, htmlElementProperties);
  
      // Evaluate focus before render
      _evaluateFocusBeforeRender();
  
      // Retrieve the global theme (assuming getTheme is imported and used similarly to React)
      const theme = getTheme();
  
      // Create the component using the `h` function
      return h(
        Tag, // The dynamic tag
        {
          ...divProps,
          //...rootProps,
          'aria-labelledby': ariaLabelledBy,
          'aria-describedby': ariaDescribedBy,
          class: [getRootClass(), className], // Combine root and custom classes
          ref: _root,
          'data-focuszone-id': _id,
          onKeydown: (ev) => _onKeyDown(ev, theme),
          onFocus: _onFocus,
          onMousedownCapture: _onMouseDown
        },
        slots // Render children via slots
      ); 
    }
  }
})
