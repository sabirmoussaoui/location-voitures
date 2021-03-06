import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { Observable, Subject } from 'rxjs';
import { Car } from '../models/Car.model';

@Injectable({
  providedIn: 'root',
})
export class CarService {
  myMethod$: Observable<any>;
  private myMethodSubject = new Subject<any>();

  constructor(public db: AngularFirestore) {
    this.myMethod$ = this.myMethodSubject.asObservable();
  }

  getCarBrand(carBrandKey) {
    return this.db.collection('carBrands').doc(carBrandKey).get();
  }
  updateCar(carKey, car) {
    return this.db
      .collection('cars')
      .doc(carKey)
      .set({
        price: car.price,
        quantity: car.quantity,
        carBrand: {
          name: car.carBrand.name,
          photoUrl: car.carBrand.photoUrl,
          carBrandKey: car.carBrand.carBrandKey,
        },
        carModel: {
          name: car.carModel.name,
          year: car.carModel.year,
          photoUrl: car.carModel.year,
          carModelKey: car.carModel.carModelKey,
        },
        place: car.place,
        door: car.door,
        fuel: car.fuel,
        main_photo: car.main_photo ? car.main_photo : '',
        photos: car.photos ? car.photos : [],
        created_at: car.created_at,
      });
  }
  myMethod(data) {
    this.myMethodSubject.next(data);
  }
  updateCarBrandAvatar(carBrandKey, avatar) {
    return this.db
      .collection('carBrands')
      .doc(carBrandKey)
      .update({
        photoUrl: avatar,
      })
      .then(function () {
        console.log('Document successfully updated!');
      });
  }
  deleteCarPhoto(carKey, photos) {
    return this.db
      .collection('cars')
      .doc(carKey)
      .update({
        photos: photos,
      })
      .then(function () {
        console.log('Photo successfully removed!');
      });
  }
  deleteCar(car) {
    // delete photos
    // if (car.data().main_photo) {
    //   const storageRef = firebase.storage().refFromURL(car.data().main_photo);
    //   storageRef.delete().then(
    //     () => {
    //       console.log('main Photo removed!');
    //     },
    //     (error) => {
    //       console.log('Could not remove main photo! : ' + error);
    //     }
    //   );
    // }
    // const photos = car.data().photos;
    // if (photos.length) {
    //   photos.forEach((photo) => {
    //     const storageRef = firebase.storage().refFromURL(photo);
    //     storageRef.delete().then(
    //       () => {
    //         console.log('Photo removed!' + photo);
    //       },
    //       (error) => {
    //         console.log('Could not remove  photo! : ' + error);
    //       }
    //     );
    //   });
    // }
    return this.db.collection('cars').doc(car.id).delete();
  }

  getCarsSnapshot() {
    return this.db.collection('cars').snapshotChanges();
  }

  getCarBrands() {
    return this.db.collection('carBrands').get();
  }

  createCar(car: Car) {
    return this.db.collection('cars').add({
      price: car.price,
      quantity: car.quantity,
      carBrand: {
        name: car.carBrand.name,
        photoUrl: car.carBrand.photoUrl,
        carBrandKey: car.carBrand.carBrandKey,
      },
      carModel: {
        name: car.carModel.name,
        year: car.carModel.year,
        photoUrl: car.carModel.year,
        carModelKey: car.carModel.carModelKey,
      },
      place: car.place,
      door: car.door,
      fuel: car.fuel,
      main_photo: car.main_photo ? car.main_photo : '',
      photos: car.photos ? car.photos : [],
      created_at: car.created_at,
    });
  }

  createPhotos(allPhotos, carBrand, carModel) {
    allPhotos.forEach((photo) => {
      return this.db.collection('photos').add({
        link: photo,
        carBrand: {
          name: carBrand.name,
          photoUrl: carBrand.photoUrl,
          carBrandKey: carBrand.carBrandKey,
        },
        carModel: {
          name: carModel.name,
          year: carModel.year,
          photoUrl: carModel.year,
          carBrandKey: carModel.carBrandKey,
          carModelKey: carModel.carModelKey,
        },
      });
    });
  }
  findPhotosByCarModel(carModelKey, value) {
    return this.db
      .collection('photos', (ref) =>
        ref.where('carModel.carModelKey', '==', carModelKey).limit(value)
      )
      .valueChanges();
  }
  /// Upload Image

  uploadMainImage(file: File, progress: { percentage: number }) {
    return new Promise((resolve, reject) => {
      const almostUniqueFileName = Date.now().toString();
      const upload = firebase
        .storage()
        .ref()
        .child('images/car/' + almostUniqueFileName + file.name)
        .put(file);
      upload.on(
        'state_changed',
        function (snapshot) {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          progress.percentage = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
              break;
          }
        },
        function (error) {
          console.log(error);
        },
        function () {
          resolve(upload.snapshot.ref.getDownloadURL());
        }
      );
    });
  }
}
