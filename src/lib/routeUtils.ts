import type { Path } from "../router";

export function comparePath(location: string, path: Path) {
  // paths can look like this: /:organizationId/chats/:chatId
  // a location can look like this: /123/chats/456

  // we need to compare the two and see if they match
  // we can do this by splitting the location and path into their parts

  const locationParts = location.split("/");
  const pathParts = path.split("/");
  // we can then compare the parts

  // if the length of the parts is different, the paths don't match
  if (locationParts.length !== pathParts.length) {
    return false;
  }

  // if the length is the same, we need to check each part

  // we can do this by looping through the parts

  for (let i = 0; i < locationParts.length; i++) {
    const locationPart = locationParts[i];
    const pathPart = pathParts[i];

    // if the path part starts with a colon, it's a param
    // so we can skip it
    if (pathPart.startsWith(":")) {
      continue;
    }

    // if the location part doesn't match the path part, the paths don't match
    if (locationPart !== pathPart) {
      return false;
    }
  }

  // if we get here, the paths match

  return true;
}
