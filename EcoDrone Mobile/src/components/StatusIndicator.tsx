import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface Step {
  label: string;
  completed: boolean;
  active: boolean;
}

interface StatusIndicatorProps {
  steps: Step[];
}

export default function StatusIndicator({ steps }: StatusIndicatorProps) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <View style={styles.stepWrapper}>
            <View
              style={[
                styles.circle,
                step.completed && styles.circleCompleted,
                step.active && !step.completed && styles.circleActive,
              ]}
            >
              {step.completed ? (
                <Ionicons name="checkmark" size={18} color={colors.white} />
              ) : (
                <View
                  style={[
                    styles.dot,
                    step.active ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.label,
                (step.completed || step.active) && styles.labelActive,
              ]}
            >
              {step.label}
            </Text>
          </View>

          {index < steps.length - 1 && (
            <View style={styles.lineWrapper}>
              <View style={styles.lineBase} />
              <View
                style={[
                  styles.lineFill,
                  {
                    width:
                      steps[index + 1].completed
                        ? '100%'
                        : steps[index + 1].active
                        ? '50%'
                        : '0%',
                  },
                ]}
              />
            </View>
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepWrapper: {
    alignItems: 'center',
    zIndex: 1,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  circleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotInactive: {
    backgroundColor: colors.gray300,
  },
  label: {
    fontSize: 11,
    marginTop: 6,
    color: colors.gray500,
    textAlign: 'center',
    maxWidth: 70,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  lineWrapper: {
    flex: 1,
    height: 2,
    marginTop: 19,
    marginHorizontal: 4,
    backgroundColor: colors.gray200,
    position: 'relative',
  },
  lineBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.gray200,
  },
  lineFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});
