import React from 'react';
import {
    View,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { AppBackground } from './BackgroundImage';

interface ScreenLayoutProps {
    children: React.ReactNode;
}

export const ScreenLayout = ({ children }: ScreenLayoutProps) => (
    <View className="flex-1 relative">
        <AppBackground />

        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            className="flex-1"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1">{children}</View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    </View>
);
