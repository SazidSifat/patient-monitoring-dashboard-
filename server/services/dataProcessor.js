// Simple threshold-based fall detection
// In a real system, this would be more complex (e.g., using magnitude of acceleration vector)

function processSensorData(data) {
    try {
        if (!data) {
            console.warn('Empty data received');
            return { ...data, fallDetected: false };
        }

        const { gyro, accel } = data;
        let fallDetected = false;

        // Mock Fall Detection Logic
        // If acceleration magnitude > threshold, trigger fall
        // Real fall detection usually involves analyzing the acceleration vector magnitude (SVM)
        // SVM = sqrt(ax^2 + ay^2 + az^2)

        if (accel && typeof accel === 'object') {
            const x = accel.x || 0;
            const y = accel.y || 0;
            const z = accel.z || 0;
            const svm = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
            
            // Threshold for fall (e.g., > 2.5g or < 0.5g depending on orientation/impact)
            if (svm > 25) { // Assuming m/s^2, ~2.5g
                fallDetected = true;
                console.warn(`Fall detected! SVM: ${svm.toFixed(2)}`);
            }
        }

        // Also check if fall was explicitly sent by ESP32
        if (data.fallDetected) {
            fallDetected = true;
        }

        return {
            ...data,
            fallDetected
        };
    } catch (error) {
        console.error('Error processing sensor data:', error);
        return { ...data, fallDetected: false };
    }
}

module.exports = { processSensorData };
