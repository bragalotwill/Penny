
export const validateString = (str: string, minLength: number = null, maxLength: number = null, regex: RegExp = null) => {
    if (typeof str !== "string") {
        return false
    }

    if (minLength) {
        if (Number.isInteger(minLength) && str.length < minLength) {
            return false
        }
    }

    if (maxLength) {
        if (Number.isInteger(maxLength) && str.length < maxLength) {
            return false
        }
    }

    if (regex) {
        if (!str.match(regex)) {
            return false
        }
    }
    return true
}

export const validateUsername = (username: string) => {
    return validateString(username, 5, 20, /[a-zA-Z0-9]+/)
}

export const validatePassword = (password: string) => {
    return validateString(password, 6, 30, /[a-zA-Z0-9!@#$%^&*]+/)
}

export const validateInteger = (num: number, minValue: number = null, maxValue: number = null) => {
    if (!Number.isInteger(num) || !Number.isFinite(num)) {
        return false
    }

    if(minValue) {
        if (!Number.isInteger(minValue) || num < minValue) {
            return false
        }
    }

    if (maxValue) {
        if (!Number.isInteger(maxValue) || num > maxValue) {
            return false
        }
    }

    return true
}

export const validateEmail = (email: string) => {
    if (!validateString(email, 255)) {
        return false
    }
    const validator = require("email-validator")
    return validator.validate(email)
}