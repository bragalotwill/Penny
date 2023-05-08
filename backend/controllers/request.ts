export const validateString = (str: string, minLength: number = null, maxLength: number = null, regex: RegExp = null) => {
    if (typeof str !== "string") {
        return false
    }

    if (minLength && Number.isInteger(minLength)) {
        if (str.length < minLength) {
            return false
        }
    }

    if (maxLength && Number.isInteger(maxLength)) {
        if (str.length > maxLength) {
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

    if (minValue && Number.isInteger(minValue)) {
        if (num < minValue) {
            return false
        }
    }

    if (maxValue && Number.isInteger(maxValue)) {
        if (num > maxValue) {
            return false
        }
    }

    return true
}

export const validateEmail = (email: string) => {
    if (!validateString(email, 5, 255)) {
        return false
    }
    // TODO: Add more validation
    return true
}