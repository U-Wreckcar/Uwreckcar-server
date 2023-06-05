export const responseBody = (success: boolean, message: string, data: any) => {
  return {
    result : { success, message },
    data,
  };
};