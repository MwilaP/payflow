// Settings service for main process using Node.js fs
import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import type { EmailConfig } from './email.service'

interface SettingsSchema {
  smtpConfig: EmailConfig | null
}

// Get settings file path
const getSettingsPath = (): string => {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'payroll-settings.json')
}

// Load settings from file
const loadSettings = (): SettingsSchema => {
  try {
    const settingsPath = getSettingsPath()
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
  return { smtpConfig: null }
}

// Save settings to file
const saveSettings = (settings: SettingsSchema): void => {
  try {
    const settingsPath = getSettingsPath()
    const userDataPath = path.dirname(settingsPath)
    
    // Ensure directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true })
    }
    
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
  } catch (error) {
    console.error('Failed to save settings:', error)
    throw error
  }
}

/**
 * Save SMTP configuration to persistent storage
 */
export const saveSMTPConfig = (config: EmailConfig): void => {
  try {
    const settings = loadSettings()
    settings.smtpConfig = config
    saveSettings(settings)
    console.log('✓ SMTP configuration saved to persistent storage')
  } catch (error) {
    console.error('✗ Failed to save SMTP configuration:', error)
    throw new Error('Failed to save SMTP configuration')
  }
}

/**
 * Load SMTP configuration from persistent storage
 */
export const loadSMTPConfig = (): EmailConfig | null => {
  try {
    const settings = loadSettings()
    if (settings.smtpConfig) {
      console.log('✓ SMTP configuration loaded from persistent storage')
      return settings.smtpConfig
    }
    console.log('ℹ No SMTP configuration found in storage')
    return null
  } catch (error) {
    console.error('✗ Failed to load SMTP configuration:', error)
    return null
  }
}

/**
 * Delete SMTP configuration from persistent storage
 */
export const deleteSMTPConfig = (): void => {
  try {
    const settings = loadSettings()
    settings.smtpConfig = null
    saveSettings(settings)
    console.log('✓ SMTP configuration deleted from persistent storage')
  } catch (error) {
    console.error('✗ Failed to delete SMTP configuration:', error)
    throw new Error('Failed to delete SMTP configuration')
  }
}

/**
 * Check if SMTP configuration exists in storage
 */
export const hasSMTPConfig = (): boolean => {
  const settings = loadSettings()
  return settings.smtpConfig !== null
}

/**
 * Clear all settings
 */
export const clearAllSettings = (): void => {
  try {
    const settingsPath = getSettingsPath()
    if (fs.existsSync(settingsPath)) {
      fs.unlinkSync(settingsPath)
    }
    console.log('✓ All settings cleared')
  } catch (error) {
    console.error('✗ Failed to clear settings:', error)
    throw new Error('Failed to clear settings')
  }
}
