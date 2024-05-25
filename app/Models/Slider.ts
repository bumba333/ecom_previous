import { DateTime } from 'luxon'
import { BaseModel, HasMany, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import SliderImage from './SliderImage'

export default class Slider extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public isActive: boolean

  @column()
  public title: string

  @column()
  public description: string

  @column()
  public linkType: 'category' | 'tag' | 'product' // Assuming link_type is one of these values

  @column()
  public linkId: number

  @hasMany(() => SliderImage)
  public images: HasMany<typeof SliderImage>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
