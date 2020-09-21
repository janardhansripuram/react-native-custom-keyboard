//@flow

import React, {Component, PureComponent} from 'react'

import {
    ScrollView,
    findNodeHandle,
    Dimensions,
    TextInput,
    View,
    Platform,
    Keyboard,
    UIManager,
} from 'react-native'

import * as CustomKeyboard from './customKeyboard'

export default class AwareCusKeyBoardScrollView extends PureComponent {
    state: Object

    showKeyBoard: boolean
    resetTimeout: number

   
    showKeyBoardSub: any
    hideKeyboardSub: any

    
    showCustomKeyBoardSub: any
    hideCustomKeyboardSub: any

    
    flag: number

    constructor() {
        super(...arguments)

        this.flag = 0
        this.state = {
            showKeyBoard: false,
        }
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            this.showCustomKeyBoardSub = CustomKeyboard.addKeyBoardShowListener(this._onFocus)
            this.hideCustomKeyboardSub = CustomKeyboard.addKeyBoardHideListener(this._onReset)
            this.showKeyBoardSub = Keyboard.addListener('keyboardDidShow', this._showSysKeyborad)
            this.hideKeyboardSub = Keyboard.addListener('keyboardDidHide', this._hideSysKeyboard)
        }
    }

    componentDidUpdate(preProps: Object, preState: Object,) {
        if (preState.showKeyBoard != this.state.showKeyBoard) {
            this._updateScrollTo()
        }
    }

    componentWillUnmount() {
        this.showCustomKeyBoardSub && CustomKeyboard.   removeKeyBoardListener(this.showCustomKeyBoardSub)
        this.hideCustomKeyboardSub && CustomKeyboard.removeKeyBoardListener(this.hideCustomKeyboardSub)
        this.showKeyBoardSub && this.showKeyBoardSub.remove()
        this.hideKeyboardSub && this.hideKeyboardSub.remove()

        this.scrollTimeout && clearTimeout(this.scrollTimeout)
        this.resetTimeout && clearTimeout(this.resetTimeout)
    }

    _showSysKeyborad = (frames: Object) => {
        console.log('show system keyboard')

        this.resetTimeout && clearTimeout(this.resetTimeout)

        this.flag++
    }

    _hideSysKeyboard = () => {
        this.flag--
        if(this.flag === 0) {
            
            this.showKeyBoard = false
            this._changeKeyBoardState()
        }
    }

    _onFocus = () => {
        this.showKeyBoard = true
        this.flag += 2

        this.resetTimeout && clearTimeout(this.resetTimeout)

        this._changeKeyBoardState()
    }

    _onReset = () => {
        this.showKeyBoard = false
        this.flag -= 2

        this.resetTimeout && clearTimeout(this.resetTimeout)

        this.resetTimeout = setTimeout(()=>{
            this._changeKeyBoardState()
        }, 200)
    }

    _changeKeyBoardState = () => {
        this.setState((preState) => {
            if (preState.showKeyBoard === this.showKeyBoard) {
                this._updateScrollTo()
                return preState
            }
            return {showKeyBoard: this.showKeyBoard}
        })
    }

    _onError = () => {}

    _updateScrollTo = () => {
        if(TextInput.State.currentlyFocusedField() == null) {
            return
        }

        const currentlyTfNode = TextInput.State.currentlyFocusedField()
        const scrollViewNode = findNodeHandle(this.refs.scrollView)

        
        if (this.state.showKeyBoard) {
            UIManager.measureInWindow(scrollViewNode, (x, y, width, height) => {
                UIManager.measureLayout(
                    currentlyTfNode,
                    scrollViewNode,
                    this._onError,
                    (left, top, width, height) => {
                        const windowHeight = Dimensions.get('window').height
                        const subHeight = windowHeight - CustomKeyboard.currentHeight
                        const currentHeight = top + height + y + 30 //上下padding高度
                        if (subHeight < currentHeight) {
                            this.refs.scrollView.scrollTo({y: currentHeight - subHeight})
                        }
                    }
                )
            })
        } else {
            this.refs.scrollView.scrollTo({y: 0})
        }
    }

    render() {
        const {children, otherProps} = this.props
        return (
            <ScrollView
                ref="scrollView"
                key="scrollView"
                keyboardShouldPersistTaps="handled"
                {...otherProps}
            >
                {this.props.children}
                <View style={{height: this.state.showKeyBoard ? CustomKeyboard.currentHeight : 0}}/>
            </ScrollView>
        )
    }
}
