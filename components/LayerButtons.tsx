import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MapLayerType } from '../store/types/types';

interface LayerButtonsProps {
    activeLayer: MapLayerType;
    onLayerChange: (layer: MapLayerType) => void;
    onLocationRequest: () => void;
}

const LayerButtons: React.FC<LayerButtonsProps> = (
    {
        activeLayer,
        onLayerChange,
        onLocationRequest
    }) => {
    return (
        <View style={styles.sidePanel}>
            <View style={styles.layerButtons}>
                <TouchableOpacity
                    style={[styles.layerButton, activeLayer === MapLayerType.TEMPERATURE ? styles.activeLayerButton : null]}
                    onPress={() => onLayerChange(MapLayerType.TEMPERATURE)}
                >
                    <Text style={styles.layerButtonText}>🌡️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.layerButton, activeLayer === MapLayerType.PRECIPITATION ? styles.activeLayerButton : null]}
                    onPress={() => onLayerChange(MapLayerType.PRECIPITATION)}
                >
                    <Text style={styles.layerButtonText}>🌧️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.layerButton, activeLayer === MapLayerType.WIND ? styles.activeLayerButton : null]}
                    onPress={() => onLayerChange(MapLayerType.WIND)}
                >
                    <Text style={styles.layerButtonText}>💨</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.layerButton, activeLayer === MapLayerType.CLOUDS ? styles.activeLayerButton : null]}
                    onPress={() => onLayerChange(MapLayerType.CLOUDS)}
                >
                    <Text style={styles.layerButtonText}>☁️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.layerButton, activeLayer === MapLayerType.PRESSURE ? styles.activeLayerButton : null]}
                    onPress={() => onLayerChange(MapLayerType.PRESSURE)}
                >
                    <Text style={styles.layerButtonText}>📊</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.layerButton, activeLayer === MapLayerType.SNOW ? styles.activeLayerButton : null]}
                    onPress={() => onLayerChange(MapLayerType.SNOW)}
                >
                    <Text style={styles.layerButtonText}>❄️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.layerButton, activeLayer === MapLayerType.NONE ? styles.activeLayerButton : null]}
                    onPress={() => onLayerChange(MapLayerType.NONE)}
                >
                    <Text style={styles.layerButtonText}>🗺️</Text>
                </TouchableOpacity>

                {/* GPS button placed below layers */}
                <TouchableOpacity
                    style={[styles.layerButton, styles.gpsButton]}
                    onPress={onLocationRequest}
                >
                    <Ionicons name="locate" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sidePanel: {
        position: 'absolute',
        left: 16,
        top: Platform.OS === 'ios' ? 100 : 80,
        zIndex: 10,
    },
    layerButtons: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    layerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    activeLayerButton: {
        backgroundColor: 'rgba(0, 120, 255, 0.9)',
    },
    layerButtonText: {
        fontSize: 16,
    },
    gpsButton: {
        marginTop: 8,
        backgroundColor: 'rgba(0, 150, 136, 0.9)',
    },
});

export default LayerButtons;