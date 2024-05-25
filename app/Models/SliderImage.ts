import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Slider from './Slider'

export default class SliderImage extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public fileName: string

  @column()
  public sliderId: string

  @column()
  public imageUrl: string

  @belongsTo(() => Slider)
  public slider: BelongsTo<typeof Slider>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
