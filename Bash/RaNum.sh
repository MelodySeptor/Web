#!/bin/bash
###
#$1: seed
#$2: number of random numbers
#$3: number of digits to the number
#$4: save on the file
###

clear

#Constants
declare -r TRUE=1
declare -r FALSE=0
declare -r MAX_NUM=5

#Function that check if can write to the file or not
function write_text {
if [[ $file -eq $TRUE ]]
then
        echo $ran_num >> ranum.txt
else
        echo $ran_num
fi
}

#Function that generates a random number
#Random number will be at ran_num
function generate_ran_num {
        num1=$(((RANDOM) + 4))
        num1=$((num1 / 2))

        num2=$(((RANDOM) + $(((RANDOM)))))
        num2=$((num2 / 2))

	ran_num=$((RANDOM % $(($(($((num1+num2)) + $seed )) + $(($seed - aux))))))
}

#Check if have write to output file option
if [[ $4 -eq $TRUE ]]
then
        file=$TRUE
else
        file=$FALSE
fi

#Check if have a limitation for the number
if [[ $3 -eq $FALSE ]]
then
	echo "Error: maxium digit must be 5"
	num_dig=3
elif [[ $3 -gt $MAX_NUM ]]
then
	echo "Error: maxium digit must be 5"
	num_dig=3
else
	num_dig=$3
fi

#Check if has the number of loops
if [[ $2 -eq $FALSE ]]
then
	aux=1
else
	aux=$2
fi

#Check if have any seed
if [[ $1 -eq $FALSE ]]
then
	seed=404
else
	seed=$1
fi

#Check if can operate in the future
while [[ $aux -gt $seed ]]; do
	aux=$(($aux / 2))
done

#Show current info
echo "seed: $seed"
echo "numbers: $aux"
echo "digits: $num_dig"
echo "file mode: $file"
echo ""

#Main
i=0
while [[ $i -lt $aux ]]; do

	generate_ran_num

	#Check if need an especific number of digits
	if [[ $num_dig -ne 0 ]]
	then
		n="${ran_num//[^[:digit:]]/}"
		if [[ ${#n} -eq $num_dig ]]
		then
			write_text
			i=$((i + 1))
		fi
	else
		write_text
		i=$((i + 1))
	fi
done
