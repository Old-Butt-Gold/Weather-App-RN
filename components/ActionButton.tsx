import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';

interface ActionButtonProps {
    onPress: () => void;
    title: string;
    visible: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onPress, title, visible }) => {
    if (!visible) return null;

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={onPress}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 170 : 130,
        alignSelf: 'center',
        backgroundColor: '#2196F3',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ActionButton;