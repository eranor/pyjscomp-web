import { chooseRegex } from './regex';

export const validateUserInfo = (userObject, errors, fieldName) => {
  const errorList = createErrorList(userObject[fieldName], fieldName);
  const passwordsMatch = userObject.password === userObject.passwordAgain;
  if (fieldName === 'password' || fieldName === 'passwordAgain') {
    const oppositeField = 'password' === fieldName ? 'passwordAgain' : 'password';
    return {
      ...errors,
      [fieldName]: [...errorList, ...(passwordsMatch ? [] : ["Passwords don't match!"])],
      [oppositeField]: [...errorList, ...(passwordsMatch ? [] : ["Passwords don't match!"])],
    };
  } else {
    return { ...errors, [fieldName]: errorList };
  }
};

const createErrorList = (inputValue, fieldName) => {
  return chooseRegex(fieldName)
    .filter((o) => !o.regex.test(inputValue))
    .map((o) => o.message);
};
