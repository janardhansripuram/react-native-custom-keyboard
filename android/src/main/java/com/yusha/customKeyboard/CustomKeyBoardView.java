package com.jana.customKeyboard;

import android.content.Context;
import android.view.MotionEvent;

import com.facebook.react.ReactRootView;


public class CustomKeyBoardView extends ReactRootView {
    public CustomKeyBoardView(Context context) {
        super(context);
    }

    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        float y = ev.getY();
        final float scale = getContext().getResources().getDisplayMetrics().density;
        float boundY = 54 * scale;
        if (y < boundY) {
            return false;
        }
        return super.onTouchEvent(ev);
    }
}
