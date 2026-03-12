Welcome to the APPN Phenomate wiki!


## Phenomate Data Transfer and Preprocessing
The Phenomate system is designed as a data transfer facility for the Phenomate rover, which is a ground-based 
phenotype remote sensing platform. The Phenomate data transfer software operates in a client-server based manner, 
consisting of:
 - A web based frontend, written using typescript, with `React` and `nodejs`.
 - A Python based backend, using `Django` for REST API development.
 - The `Celery` Python based distributed processing library, using Rabbit-MQ for messaging.
 
Although the software operates in the form of a web application, it is designed to run on a desktop computer. This 
is enabled via a specialised web based file browser (`VFS`) 

It runs on the follwing systems:
Linux
 - Native Linux desktop
 - Docker
Windows
 - Docker only

The data transfer system has a specialised library ([`appm`](https://github.com/aus-plant-phenomics-network/appn-project-manager) that allows 
a user to specify the directory placement of a file being transfered.  The implementation of the `appm` library uses a 
specialised `.yaml` format template file that specifies the structure being used. The template file system is flexible 
and the template being used is designed around an assumed, consistent filename structure that is implemented by the 
rover based software during data collection. 

An example of the filename structure is as follows:
```
YYYY-MM-DD_HH-MM-SS_UUUUUU_TIMEZONE_INFO_SENSORNAME.bin
```
This filename format has sections of the filename delineated by the '_' character, so that the `appm` library can 
split the filename into useful sections and determine their placement in a project directory structure.

An example of a filename is as follows: : `2025-10-29_10-54-14_783583_+1030_Roseworthy-Barley-plot-1_jai1.bin`

Various parts of the filename are used in the Phenomate processing: 
 - The date information is created as part of the directory heirachy, after some reformatting
e.g. The above example filename date
```
 20251029+1030
```
 - The `SENSORNAME` string (e.g. `jai1`) is used within the [`phenomate-core`](https://github.com/aus-plant-phenomics-network/phenomate-core)
   library to create the specialised processing that a number of the sensors require to unpack files from their 
   Protobuf defined serialisation format. 
   
### Specialised processing
Although the `appm` library is flexible in the files and formats that files can take, unfortunately not all
instruments on the Phenomate rover platform can be programmed to save their data in the expected filename format.

This section will go through some specialised processing that the Phenomate data offload system completes
for the various instruments. This processing is carried out during the `phenomate-core` library processing stages
in the server-side Python processing.

#### JAI RGB Camera



## The appn-project-manager Python package

### Installation
The package is installable from PyPi -
```bash
pip install appm
```
and source is availble on GitHub -
```bash
git clone git@github.com:aus-plant-phenomics-network/appn-project-manager.git
```

### Introduction
The `appm` package is part of the software tooling that is used to transfer data from and perform initial  
processing of data that is collected by the `Phenomate` ground based robotic phenotyping data collection  
platform.

The [`appm`](https://github.com/aus-plant-phenomics-network/appn-project-manager) package collects together the information needed to create 
an output project directory structure for the Phenomate data transfer operations. It enables a 
flexible processing interface using a YAML based template specification file, which enables use 
of selected combinations of the input parameters and defined named elements derived from an input 
file's filename. Individual processing can be defined for specific file types, as governed by file 
format extensions e.g. 'csv' or 'bin'. Once a defined output directory is constructed, further 
bespoke processing is enabled using the [`phenomate-core`](https://github.com/aus-plant-phenomics-network/phenomate-core) package.

### The project template file
An understanding of the format of the `appm` package `template.yaml` file is important for setting up a 
project directory structure. The following description is to help with understanding of the parts of the 
template file and how they can be used to enable a project directory structure of our choice.


#### A working example
In the following example we aim to have a directory conforming to the following structure:
```
/<root>/<institution>/<project>/<site>/<platform_name>/<date>/<processing_level>/<sensor>
|----------------- base directory --------------------|--- filename derived directory ---|
```

This is the standardised APPN directory structure, where data collected by a specified `<sensor>`, that
was attached to a particular `<platform_name>` on a particular `<date>` at a particular `<site>`, for a 
particular `<project>` will be stored. This structure is defined within the `template.yml` file used. 
The `<root>` part is a selected base directory on the filesystem we are moving data to. The two sectons
`base directory` and `filename derived directory` are derived from particular parts of the `template.yaml` 
file, which are discussed futher in the following sections.

##### Structure of the ```template.yaml` file

The `template.yaml` file can be broken into 3 main parts: 
1. The `naming_convention` section: This section will define the `base directory` from where files will 
   be placed. The section defines a list named `structure` and a string named `sep`.
2. The `layout` section: This also defines a `structure` list, which references inputs that will make up 
   the `filename derived directory` extension to the `base directory`. These inputs are specified in the 
   `file` section (see part 3.) and are named representations of the sections found in the filename of 
   the files being transferred.
3. The `file`  section: This section can specify how a data file's filename can be deconstructed and 
   saved a named variables that can be used in the `layout` section.
   
###### `naming_convention` dictionary
 There are two parts to this section:
1. The `structure` list is made up of items from the initialisation of the `ProjectManager` Python class. 
 e.g. 
 ```json
 structure: ['organisationName', 'project', 'site', 'platform']
 ```
 There are a few things to keep in mind with this list:
 a. Any of the variables specified in the ProjectManager initialisation can be specified in the `structure` list.
 b. The order in which items are listed will define the order of their creation in the directory hierarchy.
 
2. The `sep` item. use `sep: "\"`to specify elements as separate directories:  
       `<root>/organisationName/project/site/platform `  
     or any other string e.g. `sep: "_"` to concatenate all elements into a single directory name:  
       `<root>/organisationName_project_site_platform `
       
##### `layout` dictionary
 There are three parts to this section, `structure`, `mapping` and `date_convert`.
 An example is shown here:
 
 ```json
 layout:
  structure: [  'date', 'procLevel', 'sensor' ]
  mapping:
    procLevel:
      raw: 'T0-raw'
      proc: 'T1-proc'
      trait: 'T2-trait'
  date_convert:
    base_timezone: 'UTC'
    output_timezone: 'Australia/Adelaide'
    input_format: '%Y-%m-%d %H-%M-%S'  # concatenated file components: 'date' and 'time' 
    output_format: '%Y%m%d%z'
 ```
 
 ###### 1. The `structure` list
 This is the part that controls where in the filesystem the output files will be placed, and most of the information is obtained from the filename of the file being transfered. The secion is very flexible in the way it obtains information and works in conjunction with the `file` section of the `template.yaml` file. The `file` section lets a user *specify the exact decomposition and naming* of the parts of the file, which are then alowed to be used in the `structure` list to form a directory path.
 
 An example `file` section for processing a `.bin` file extension file is shown below. The three `components` that are used in the `structure` list are highlighted. 
  
  ```json
  file:
    "bin":
      sep: "_"
      preprocess:
        find: ''
        replace: ''
        casesensitive: 'False'
      default:
        procLevel: raw
      components:
        - sep: "_"
          components:
          - ['date', '\d{4}-\d{2}-\d{2}']   <-------- `date`
          - ['time', '\d{2}-\d{2}-\d{2}']
        - ['ms', '\d{6}']      
        - name: 'timezone'
            pattern: '[+-]\d{4}'
            required: false
        - ['site_fn', '[^_.]+']
        - ['sensor', '[^_.]+']   <-------------------- `sensor`
        - name: 'procLevel'      <-------------------- `procLevel`
            pattern: 'T0-raw|T1-proc|T2-trait|raw|proc|trait'
            required: false
  
  ```
 Although only three componets are used, the `structure` list could use any of the defined sections of the file e.g. [  'date', 'time', 'ms', 'timezone', 'site_fn', 'sensor', 'procLevel' ] and any order could be specified, with the order specifying the directory heirachy.
 
 The `timezone` and the `procLevel` are defined a little differently, using the `name` specifier, this is because the two parts are specified as not required in the filename, however if they are present, then they will be extracted. `procLevel` also has a default specified, so if it is not found then a value will sill be used in the directory structure.
  
  
###### Programmatic Initialisation of the APPM `ProjectManager` class

```python
# If the following is in the template.json file:
# structure: ['organisationName', 'project', 'site', 'platform']

# Import the module
from appm import ProjectManager

# Initialise the object, specifying a template file
pm = ProjectManager.from_template(
    root="/mnt/research_data/data/phenomate",
    year=2024,
    summary="Wheat yield trial",
    platform="phenomate_1",    <---------------- 'platform'
    project="OzBarley_01",     <---------------- 'project'
    site="horsham",  <----------------------------- 'site'
    internal=True,
    researcherName="Joshua Bowden",
    organisationName="Adelaide University", <--- 'organisationName'
    template="/tmp/template_config.yaml" )
    
# we can now print the project directory that would be used
print(str(pm.location)) 
# '/mnt/research_data/data/phenomate/Adelaide-University/OzBarley_01/Horsham/phenomate_1'


# and if we supply a filename we can get a full directory structure to where a file will be placed 
print(str(pm.location) + '/' + pm.get_file_placement("2025-08-14_06-30-03_393242_extra-site-details_jai.csv"))
# '/mnt/research_data/data/phenomate/Adelaide-University/OzBarley_01/Horsham/phenomate_1/20250814+0930/T0-raw/jai'

# init_project() will actually create the project directory and write a metadata.yaml file
pm.init_project()
```





