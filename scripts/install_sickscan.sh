#!/bin/bash
# Script to install LIDAR Drivers and dependencies

driver_copy_location=""

# Function to display error message and exit
usage() {
    echo "Usage: $0 -l <driver_copy_location>"
    echo "  -l  location of where to copy library files (required)"
    exit 1
}

# Parse arguments
while getopts "l:" opt; do
    case $opt in
        l)
            driver_copy_location="$OPTARG"
            ;;
        *)
            usage
            ;;
    esac
done

# Check if therequired was provided and has a value
# Check if both required flags were provided
if [ -z "$driver_copy_location" ]; then
    echo "Error: -l <driver_copy_location> arguments are required."
    usage
fi

#make directory and move into it
mkdir -p ./sick_scan_ws
cd ./sick_scan_ws

#clone repos
#Tested with commit #d99166c, no 'releases' and this is not actively being updated.
git clone https://github.com/SICKAG/libsick_ldmrs.git
#Tested with 3.6.0
git clone --depth 1 --branch 3.6.0 https://github.com/SICKAG/sick_scan_xd.git

#build  libsick_ldmrs
pushd libsick_ldmrs
mkdir -p ./build
cd ./build
cmake -G "Unix Makefiles" ..
make -j4
sudo make -j4 install
popd

#Build sick_generic_caller and libsick_scan_xd_shared_lib.so:
mkdir -p ./build
pushd ./build
rm -rf ./*
export ROS_VERSION=0
#run cmake command, but added option -DO=0 to change variable O to be 0 for line 54 to add compile options -f -O0 for segmentation issue
cmake -DROS_VERSION=0 -DO=0 -G "Unix Makefiles" ../sick_scan_xd
make -j4
sudo make -j4 install
popd

#function to check and create directory tree if they don't exist
check_and_create_dir() {
    local DIR="$1"
    if [ -d "$DIR" ]; then
        echo "Directory $DIR exists. Will not create the folders."
    else
        echo "Directory $DIR does not exist. Creating..."
        mkdir -p "$DIR"
    fi
}

#move compiled versions to persistent location on the brain
#uses rsync - should be installed but its a codependency
#copying for lib folder
LIB_COPY_FOLDER="${driver_copy_location}/lib/"
echo "Copying lib drivers to $LIB_COPY_FOLDER"
check_and_create_dir "$LIB_COPY_FOLDER"

rsync -av \
  --include="*/" \
  --include="libsick_*" \
  --include="cmake/**" \
  --include="share/sick_ldmrs/**" \
  --exclude="*" \
  /usr/local/lib/ "$LIB_COPY_FOLDER"


#copying for include folder
INCLUDE_COPY_FOLDER="${driver_copy_location}/include/"
echo "Copying include drivers to $INCLUDE_COPY_FOLDER"
check_and_create_dir "$INCLUDE_COPY_FOLDER"
rsync -av --include="sick*" --exclude="*" /usr/local/include/ $INCLUDE_COPY_FOLDER