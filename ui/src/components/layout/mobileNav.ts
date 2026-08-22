/**
 * Whether a mobile nav tap should close the overlay immediately.
 *
 * Cross-route taps must leave the overlay up until pathname updates so the
 * old page is never painted under a closing menu. Same-route taps never
 * change pathname, so they close here.
 */
export function shouldCloseMobileMenuOnClick(
  pathname: string,
  targetPath: string,
): boolean {
  return pathname === targetPath;
}
