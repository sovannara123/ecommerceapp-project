declare module "multer" {
  function multer(options?: any): any;

  namespace multer {
    function diskStorage(options: any): any;
  }

  export = multer;
}
