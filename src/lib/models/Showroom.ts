// src/lib/models/Showroom.ts
import mongoose, { Document, Model, Schema } from "mongoose"

export interface ICarPlacement {
  vehicleId: string
  yaw:       number
  distance:  number
  rotation:  number
  elevation: number
}

export interface IShowroom extends Document {
  showroomId:  string
  panoramaUrl: string
  floorY:      number
  placements:  ICarPlacement[]
  updatedAt:   Date
}

const PlacementSchema = new Schema<ICarPlacement>({
  vehicleId: { type: String, required: true },
  yaw:       { type: Number, required: true, min: 0, max: 360 },
  distance:  { type: Number, required: true, min: 0.5, max: 20 },
  rotation:  { type: Number, required: true },
  elevation: { type: Number, default: 0 },
}, { _id: false })

const ShowroomSchema = new Schema<IShowroom>({
  showroomId:  { type: String, required: true, unique: true, index: true },
  panoramaUrl: { type: String, required: true },
  floorY:      { type: Number, default: -1.2 },
  placements:  { type: [PlacementSchema], default: [] },
}, { timestamps: true })

const Showroom: Model<IShowroom> =
  (mongoose.models.Showroom as Model<IShowroom>) ??
  mongoose.model<IShowroom>("Showroom", ShowroomSchema)

export default Showroom
