export default class CheckRole {
  public async handle({ auth, response }, next, allowedRoles) {
    const user = await auth.user
    await user.preload('role')
    if (!allowedRoles.includes(user.role.name)) {
      return response.status(403).json({ message: 'Access denied' })
    }
    await next()
  }
}
