import axios from "axios";

export const roles = {
  ADMIN: "admin",
  MVADMIN: "mvadmin",
  UNAUTHORIZED: "unauthorized",
};

export const menuPermissions = {
  [roles.ADMIN]: ["1", "2", "3", "5", "6", "9"],
  [roles.MVADMIN]: ["4", "5", "10"],
  [roles.UNAUTHORIZED]: [],
};

export const getUserRole = async (otherUserId='', organizationId='', token) => {
  try {
    if (!otherUserId && !organizationId) {
      return roles.UNAUTHORIZED;
    }

    let url = `${process.env.REACT_APP_API_BASE_URL}/users/role?`;

    if (otherUserId) {
      url += `otherUserId=${otherUserId}&`;
    }

    if (organizationId) {
      url += `organizationId=${organizationId}&`;
    }

    // Remove the trailing '&' if present
    url = url.endsWith('&') ? url.slice(0, -1) : url;

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const serverRole = response.data.role;
    let role;

    switch (serverRole) {
      case 'ADMIN':
        role = roles.ADMIN;
        break;
      case 'MVADMIN':
        role = roles.MVADMIN;
        break;
      case 'UNAUTHORIZED':
        role = roles.UNAUTHORIZED;
        break;
      default:
        role = roles.UNAUTHORIZED;
    }

    return role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    throw new Error('Failed to fetch user role');
  }
};